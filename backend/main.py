from __future__ import annotations
import logging
import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Algorand / AlgoKit
from algokit_utils import (
    AlgoAmount,
    AlgorandClient,
    AssetCreateParams,
    AssetOptInParams,
    AssetTransferParams,
)
from algokit_utils.config import config

# Local imports
from models import (
    SignerBundle, Profile, Notification, Store,
    CreateAccountRequest, CreateAccountResponse,
    CreateAsaRequest, CreateAsaResponse,
    OptInRequest, TransferRequest, InvestRequest, DecisionRequest,
    LocalnetAccountRequest, LocalnetAccountResponse
)

# Configure & log
config.configure(populate_app_call_resources=True)
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s %(levelname)-10s: %(message)s")
logger = logging.getLogger(__name__)
load_dotenv()

# Connect to LocalNet / Indexer
ALGOD_URL = os.getenv("ALGOD_URL")
ALGOD_TOKEN = os.getenv("ALGOD_TOKEN")
INDEXER_URL = os.getenv("INDEXER_URL")
INDEXER_TOKEN = os.getenv("INDEXER_TOKEN")
LORA_BASE = os.getenv("LORA_BASE", "https://lora.algokit.io/localnet")

if ALGOD_URL and ALGOD_TOKEN:
    algorand = AlgorandClient.from_network(
        algod_url=ALGOD_URL,
        algod_token=ALGOD_TOKEN,
        indexer_url=INDEXER_URL,
        indexer_token=INDEXER_TOKEN or None,
    )
else:
    algorand = AlgorandClient.default_localnet()

# In-memory store
STORE = Store()

# Utils
def lora_tx(txid: str) -> str:
    return f"{LORA_BASE}/transaction/{txid}"

def lora_asset(asset_id: int) -> str:
    return f"{LORA_BASE}/asset/{asset_id}"

def ensure_user(username: str) -> Profile:
    if username not in STORE.users:
        raise HTTPException(404, f"User '{username}' not found")
    return STORE.users[username]

def get_account_by_username(username: str):
    user = ensure_user(username)
    acct = STORE.accounts.get(user.address)
    if not acct:
        raise HTTPException(400, f"User {username} has no LocalNet account. Call /localnet_account first.")
    return acct

def pravatar(seed: str) -> str:
    return f"https://i.pravatar.cc/200?u={seed}"

async def fund_if_needed(address: str, amount_algo: float = 10.0) -> bool:
    acct_info = algorand.client.algod.account_info(address)
    bal = acct_info.get("amount", 0) / 1e6
    if bal < amount_algo:
        algorand.dispenser.dispense(address, AlgoAmount(algo=amount_algo))
        return True
    return False

# FastAPI app
app = FastAPI(title="Local People/NFT API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Suggest helpers (optional but handy)
@app.get("/suggest/handle")
def suggest_handle(name: str):
    base = "@" + "".join([c.lower() for c in name if c.isalnum() or c in (" ", "_")]).strip().replace(" ", "_")
    handle = base or "@user"
    # make unique across existing users
    if any(u.handle == handle for u in STORE.users.values()):
        suffix = 1
        while any(u.handle == f"{handle}_{suffix}" for u in STORE.users.values()):
            suffix += 1
        handle = f"{handle}_{suffix}"
    return {"handle": handle}

@app.get("/suggest/avatar")
def suggest_avatar(seed: str):
    return {"avatar": pravatar(seed)}

# ---------- Accounts / Profile
@app.post("/account", response_model=CreateAccountResponse)
def create_or_get_account(req: CreateAccountRequest):
    # enforce unique handle
    if any(u.handle == req.handle for u in STORE.users.values() if u.username != req.username):
        raise HTTPException(400, "Handle already taken")

    if req.username in STORE.users:
        p = STORE.users[req.username]
        return CreateAccountResponse(username=req.username, address=p.address)

    # Just store profile, no blockchain yet
    fake_address = f"APP-{req.username}"  # placeholder, not a real blockchain address
    profile = Profile(
        username=req.username,
        address=fake_address,
        name=req.name,
        handle=req.handle,
        bio=req.bio,
        linkedin=req.linkedin,
        github=req.github,
        city=req.city,
        country=req.country,
        avatar=req.avatar,
        banner=req.banner,
        valuation=250000,
        confidence=70,
        balance_algo=0.0,
        coverage="LinkedIn",
    )
    STORE.users[req.username] = profile
    STORE.notifications[req.username] = []

    return CreateAccountResponse(username=req.username, address=fake_address)

@app.get("/account/{username}")
def get_account(username: str):
    u = ensure_user(username)
    return u.__dict__

@app.get("/accounts")
def list_accounts():
    return [{"username": u.username, "address": u.address} for u in STORE.users.values()]

@app.get("/wallet")
def get_wallet(username: str = Query(...)):
    u = ensure_user(username)
    return {"address": u.address}

# ---------- NEW: ensure / create LocalNet wallet (idempotent)
@app.post("/localnet_account", response_model=LocalnetAccountResponse)
def create_localnet_account(req: LocalnetAccountRequest):
    user = ensure_user(req.username)

    acct = algorand.account.from_environment(req.username.upper(), AlgoAmount(algo=req.fund_algo))
    addr = acct.address

    # save account object directly
    STORE.accounts[addr] = acct
    STORE.username_by_addr[addr] = req.username

    user.address = addr
    user.balance_algo = req.fund_algo

    return LocalnetAccountResponse(address=addr, funded=True)

# ---------- People (feed)
@app.get("/people")
def people():
    out = []
    for u in STORE.users.values():
        out.append({
            "id": u.username,
            "name": u.name,
            "handle": u.handle,
            "image": u.avatar,
            "tagline": u.bio or "—",
            "price": 1000,
            "confidence": u.confidence,
            "asset_id": u.asset_id,
            "address": u.address,
        })
    return out


@app.post("/profile/create_asa", response_model=CreateAsaResponse)
def create_asa(req: CreateAsaRequest):
    user = ensure_user(req.username)
    acct = get_account_by_username(req.username)

    # Compose note if not provided
    note_text = req.note or (
        f"User:{user.username}|Name:{user.name}|Handle:{user.handle}|"
        f"LinkedIn:{user.linkedin}|GitHub:{user.github}|City:{user.city}|Country:{user.country}"
    )

    # ✅ sender = sb.account (AddressAndSigner)
    # ✅ manager/reserve/freeze/clawback = sb.address (string)
    print(acct)
    print(acct.address)
    print(acct.address)

    
    params = AssetCreateParams(
        sender=acct.address,
        asset_name=req.asset_name,
        unit_name=req.unit_name,
        total=req.total,
        decimals=req.decimals,
        default_frozen=False,
        manager=acct.address,
        reserve=acct.address,
        freeze=acct.address,
        clawback=acct.address,
        url=req.url or "https://example.com/metadata.json",
        note=note_text.encode("utf-8"),
    )
    print(params)

    result = algorand.send.asset_create(params)

    # Update user
    user.asset_id = result.asset_id

    me_payload = {
        "name": user.name,
        "headline": "Builder • AI + Automation",
        "region": user.country,
        "handle": user.handle,
        "bio": user.bio,
        "avatar": user.avatar,
        "banner": user.banner,
        "valuation": user.valuation,
        "confidence": user.confidence,
        "balance": user.balance_algo,
        "coverage": user.coverage,
        "address": user.address,
        "assetId": result.asset_id,
        "assetUrl": lora_asset(result.asset_id),
    }

    return CreateAsaResponse(
        addr=user.address,
        asset_id=result.asset_id,
        txid=result.tx_id,
        lora_url=lora_tx(result.tx_id),
        url=req.url or "",
        me=me_payload,
    )


# ---------- Opt-in / Transfer / Invest flow (unchanged)
@app.post("/asset/opt_in")
def opt_in(req: OptInRequest):
    user = ensure_user(req.username)
    acct = get_account_by_username(req.username)
    result = algorand.send.asset_opt_in(AssetOptInParams(sender=acct.address, asset_id=req.asset_id))
    return {"txid": result.tx_id, "lora_url": lora_tx(result.tx_id)}

@app.post("/asset/transfer")
def transfer(req: TransferRequest):
    sender_acct = get_account_by_username(req.sender_username)
    receiver = ensure_user(req.receiver_username)
    result = algorand.send.asset_transfer(AssetTransferParams(
        sender=sender_acct.address,
        receiver=receiver.address,
        asset_id=req.asset_id,
        amount=req.amount,
        note=b"Local demo transfer",
    ))
    return {"txid": result.tx_id, "lora_url": lora_tx(result.tx_id), "asset_url": lora_asset(req.asset_id)}

@app.post("/invest/request")
def invest_request(req: InvestRequest):
    buyer = ensure_user(req.buyer_username)
    seller = ensure_user(req.seller_username)

    # 1. Ensure buyer has a wallet
    buyer_acct = get_account_by_username(buyer.username)

    # 2. Opt buyer into seller's asset (if not already)
    try:
        algorand.send.asset_opt_in(
            AssetOptInParams(sender=buyer_acct.address, asset_id=req.asset_id)
        )
    except Exception as e:
        # ignore "already opted in" errors
        if "already has asset" not in str(e):
            raise

    # 3. Create notification for seller
    notif = Notification(
        id=STORE.next_id(),
        type="INVEST_REQUEST",
        from_username=buyer.username,
        to_username=seller.username,
        asset_id=req.asset_id,
        amount=req.amount,
        status="pending",
    )
    STORE.notifications[seller.username].append(notif)

    return {
        "notification_id": notif.id,
        "status": notif.status,
        "message": f"{buyer.username} requested to invest {req.amount} in {seller.username}"
    }

@app.get("/notifications")
def list_notifications(username: str = Query(...)):
    ensure_user(username)
    return [n.__dict__ for n in STORE.notifications.get(username, [])]

@app.post("/invest/decision")
def invest_decision(req: DecisionRequest):
    seller = ensure_user(req.seller_username)
    items = STORE.notifications.get(seller.username, [])
    notif = next((n for n in items if n.id == req.notification_id), None)
    if not notif:
        raise HTTPException(404, "Notification not found")
    if notif.status != "pending":
        return {"status": notif.status, "txid": notif.txid}

    seller_acct = get_account_by_username(seller.username)
    buyer = ensure_user(notif.from_username)
    result = algorand.send.asset_transfer(AssetTransferParams(
        sender=seller_acct.address,
        receiver=buyer.address,
        asset_id=notif.asset_id,
        amount=notif.amount,
        note=b"Accepted investment",
    ))
    notif.status = "accepted"
    notif.type = "INVEST_ACCEPTED"
    notif.txid = result.tx_id
    return {"status": "accepted", "txid": result.tx_id, "lora_url": lora_tx(result.tx_id)}

@app.get("/tx/{txid}")
def tx_status(txid: str):
    try:
        info = algorand.client.indexer.search_transactions(txid=txid)
        confirmed = len(info.get("transactions", [])) > 0
        return {"confirmed": confirmed}
    except Exception:
        return {"confirmed": False}
