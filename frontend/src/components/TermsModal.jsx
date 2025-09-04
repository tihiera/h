import React, { useState } from "react";
import Button from "./Button";

const TERMS_TEXT = `
CREATOR AGREEMENT

Last updated: January 2024

1. INTRODUCTION

Welcome to Launch Platform ("we," "our," or "us"). This Creator Agreement ("Agreement") governs your participation as a creator on our investment platform. By signing this agreement, you agree to be bound by these terms.

2. CREATOR RESPONSIBILITIES

As a creator on our platform, you agree to:

a) Provide accurate and truthful information about yourself, your background, and your projects
b) Maintain professional conduct in all interactions with investors and other users
c) Respond to investor inquiries in a timely and professional manner
d) Use the platform solely for legitimate business and investment purposes
e) Comply with all applicable laws and regulations in your jurisdiction

3. INVESTMENT TERMS

When you list yourself for investment on our platform:

a) You acknowledge that investments are speculative and carry inherent risks
b) You agree to use invested funds responsibly and in accordance with your stated goals
c) You understand that investors are taking a financial risk by investing in you
d) You commit to providing regular updates on your progress and use of funds

4. INTELLECTUAL PROPERTY

You retain ownership of your intellectual property, but grant us a limited license to:

a) Display your profile, content, and materials on our platform
b) Use your likeness and information for marketing and promotional purposes
c) Share your updates and progress with investors and the community

5. FINANCIAL OBLIGATIONS

a) Platform fees may apply to successful funding campaigns
b) You are responsible for all taxes related to funds received through the platform
c) You must comply with all financial reporting requirements in your jurisdiction

6. PROHIBITED ACTIVITIES

You may not:

a) Misrepresent your identity, background, or intentions
b) Use the platform for illegal activities or fraud
c) Harass, threaten, or abuse other users
d) Attempt to circumvent platform security measures
e) Violate any applicable laws or regulations

7. PLATFORM RIGHTS

We reserve the right to:

a) Review and approve creator profiles before publication
b) Suspend or terminate accounts that violate these terms
c) Modify platform features and policies with reasonable notice
d) Remove content that violates our community standards

8. RISK DISCLOSURE

You acknowledge that:

a) Investment outcomes are not guaranteed
b) You may receive no funding despite creating a profile
c) Market conditions and investor sentiment can change rapidly
d) Past performance does not guarantee future results

9. DATA AND PRIVACY

We will handle your personal data in accordance with our Privacy Policy. You consent to:

a) Collection and processing of your profile information
b) Sharing relevant information with potential investors
c) Using your data for platform improvement and analytics

10. DISPUTE RESOLUTION

Any disputes arising from this agreement will be resolved through:

a) Good faith negotiation between the parties
b) Binding arbitration if negotiation fails
c) Applicable laws of the jurisdiction where our company is registered

11. TERMINATION

This agreement may be terminated:

a) By either party with 30 days written notice
b) Immediately by us for material breach of terms
c) Automatically if your account is suspended or banned

12. MODIFICATIONS

We may modify this agreement with reasonable notice. Continued use of the platform after modifications constitutes acceptance of the new terms.

13. LIMITATION OF LIABILITY

To the maximum extent permitted by law, we are not liable for:

a) Investment losses or failed funding campaigns
b) Indirect, incidental, or consequential damages
c) Loss of profits, data, or business opportunities
d) Actions or omissions of other platform users

14. INDEMNIFICATION

You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from:

a) Your use of the platform
b) Violation of these terms
c) Infringement of third-party rights
d) Your interactions with investors or other users

15. ENTIRE AGREEMENT

This agreement constitutes the entire agreement between you and us regarding your use of the platform as a creator.

By clicking "I Agree and Sign," you acknowledge that you have read, understood, and agree to be bound by all terms of this Creator Agreement.

For questions about this agreement, please contact us at legal@launchplatform.com

© 2024 Launch Platform. All rights reserved.
`;

export default function TermsModal({ isOpen, onClose, onAccept }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (agreed && hasScrolledToBottom) {
      onAccept();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Creator Agreement</h2>
          <p className="text-gray-600 mt-1">Please read and accept the terms to continue</p>
        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 leading-relaxed"
          onScroll={handleScroll}
        >
          <pre className="whitespace-pre-wrap font-sans">{TERMS_TEXT}</pre>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              disabled={!hasScrolledToBottom}
              className="w-4 h-4 text-[#fb6058] border-gray-300 rounded focus:ring-[#fb6058]/40 disabled:opacity-50"
            />
            <label htmlFor="agree-terms" className="ml-2 text-sm text-gray-700">
              I have read and agree to the Creator Agreement
              {!hasScrolledToBottom && <span className="text-red-500 ml-1">(scroll to bottom first)</span>}
            </label>
          </div>
          
          <div className="flex gap-3 justify-end">
            <Button 
              onClick={onClose}
              variant="secondary"
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!agreed || !hasScrolledToBottom}
              variant="cta"
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              I Agree and Sign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
