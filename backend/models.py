"""
Data models and API request/response models for the Local People/NFT API.
"""
from __future__ import annotations
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
from pydantic import BaseModel

# ---------- Data Models (using dataclasses)

@dataclass
class SignerBundle:
    """Holds signer object created by AlgoKit + address string."""
    account: any  # AddressAndSigner from algokit-utils
    address: str

@dataclass
class Profile:
    username: str
    address: str
    name: str
    handle: str
    bio: str
    linkedin: str
    github: str
    city: str
    country: str
    avatar: str
    banner: str
    valuation: int = 0
    confidence: int = 0
    balance_algo: float = 0.0
    coverage: str = "LinkedIn"
    asset_id: Optional[int] = None  # profile ASA/NFT id

@dataclass
class Notification:
    id: int
    type: str  # INVEST_REQUEST | INVEST_ACCEPTED | INVEST_DECLINED
    from_username: str
    to_username: str
    asset_id: int
    amount: int
    status: str  # pending | accepted | declined
    txid: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

class Store:
    """In-memory store for development purposes only."""
    def __init__(self):
        self.accounts: Dict[str, any] = {}                    # address -> account object
        self.users: Dict[str, Profile] = {}                   # username -> profile
        self.username_by_addr: Dict[str, str] = {}            # address -> username
        self.notifications: Dict[str, List[Notification]] = {}# username -> list
        self._id = 1

    def next_id(self) -> int:
        self._id += 1
        return self._id

# ---------- API Request/Response Models (using Pydantic)

class CreateAccountRequest(BaseModel):
    username: str
    name: str
    handle: str
    bio: str = ""
    linkedin: str = ""
    github: str = ""
    city: str = ""
    country: str = ""
    avatar: str = "https://i.pravatar.cc/200?img=60"
    banner: str = "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1600&auto=format&fit=crop"

class CreateAccountResponse(BaseModel):
    username: str
    address: str

class CreateAsaRequest(BaseModel):
    username: str
    asset_name: str
    unit_name: str
    total: int = 1
    decimals: int = 0
    url: str = ""
    note: str = ""

class CreateAsaResponse(BaseModel):
    addr: str
    asset_id: int
    txid: str
    lora_url: str
    url: str
    me: dict

class OptInRequest(BaseModel):
    username: str
    asset_id: int

class TransferRequest(BaseModel):
    sender_username: str
    receiver_username: str
    asset_id: int
    amount: int = 1

class InvestRequest(BaseModel):
    buyer_username: str
    seller_username: str
    asset_id: int
    amount: int = 1

class DecisionRequest(BaseModel):
    seller_username: str
    notification_id: int
    accept: bool

# --- NEW: wallet ensure endpoint
class LocalnetAccountRequest(BaseModel):
    username: str
    fund_algo: float = 10.0

class LocalnetAccountResponse(BaseModel):
    address: str
    funded: bool
