import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, HelpCircle } from 'lucide-react';
import './Chatbot.css';

const FAQ_DATA = {
    Donor: [
        { q: "How do I list food?", a: "Go to the 'Donate Food' tab and fill in the details like quantity, expiry, and pickup location." },
        { q: "What food can I donate?", a: "We accept cooked meals, dry rations, and fresh produce. Please ensure the food is safe and hygienic." },
        { q: "How do I know if an NGO claimed it?", a: "You'll receive a notification and can see the status change in your 'History' tab." }
    ],
    NGO: [
        { q: "How do I claim a donation?", a: "Browse the 'Live Feed', click on a listing that suits your capacity, and select 'Claim'." },
        { q: "What if I can't pick up?", a: "You can assign a volunteer to pick it up for you after claiming." },
        { q: "How to verify delivery?", a: "The volunteer must scan the QR code from the donor to mark it as picked up, and upload proof for delivery." }
    ],
    Volunteer: [
        { q: "How to start delivering?", a: "Complete the safety training quiz first. once certified, you can pick up available tasks from your dashboard." },
        { q: "Where do I find the pickup address?", a: "Once you accept a task, the donor's address will be visible in your task details." },
        { q: "How do I use the QR code?", a: "The donor has a QR code in their dashboard. Scan it using your app's scanner when you arrive." }
    ],
    General: [
        { q: "What is GiveBite?", a: "GiveBite is a platform connecting food donors with NGOs to reduce food waste and feed the needy." },
        { q: "How do I create an account?", a: "Click 'Register' on the landing page and choose your role: Donor, NGO, or Volunteer." },
        { q: "Is this service free?", a: "Yes, GiveBite is a non-profit initiative to help the community." }
    ]
};

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('chat_history');
        return saved ? JSON.parse(saved) : [
            { id: 1, text: "Hi! I'm your GiveBite assistant. How can I help you today?", sender: 'bot' }
        ];
    });
    const [input, setInput] = useState('');
    const [role, setRole] = useState(localStorage.getItem('user_role') || 'General');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('chat_history', JSON.stringify(messages));
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = (text) => {
        if (!text.trim()) return;

        const userMessage = { id: Date.now(), text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Simple bot logic
        setTimeout(() => {
            let response = "I'm not sure about that. Would you like to check our FAQs below?";

            // Check if it's an FAQ match
            const allFAQs = [...FAQ_DATA[role], ...FAQ_DATA.General];
            const match = allFAQs.find(faq => text.toLowerCase().includes(faq.q.toLowerCase()) || faq.q.toLowerCase().includes(text.toLowerCase()));

            if (match) {
                response = match.a;
            } else if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
                response = `Hello! I'm the ${role} support bot. Ask me anything about ${role === 'Donor' ? 'donating' : role === 'NGO' ? 'claiming' : 'delivering'} food!`;
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, text: response, sender: 'bot' }]);
        }, 600);
    };

    const handleFAQClick = (faq) => {
        const userMessage = { id: Date.now(), text: faq.q, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);

        setTimeout(() => {
            const botMessage = { id: Date.now() + 1, text: faq.a, sender: 'bot' };
            setMessages(prev => [...prev, botMessage]);
        }, 400);
    };

    const clearChat = () => {
        setMessages([{ id: 1, text: "Hi! I'm your GiveBite assistant. How can I help you today?", sender: 'bot' }]);
    };

    return (
        <div className="chatbot-container">
            {isOpen ? (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="flex items-center gap-2">
                            <HelpCircle size={20} />
                            <h3>FAQ Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-80">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-faq-options">
                        {(FAQ_DATA[role] || FAQ_DATA.General).map((faq, index) => (
                            <button key={index} onClick={() => handleFAQClick(faq)} className="faq-btn">
                                {faq.q}
                            </button>
                        ))}
                        <button onClick={clearChat} className="faq-btn text-red-500 border-red-100 hover:bg-red-50">
                            Clear Chat
                        </button>
                    </div>

                    <form
                        className="chatbot-input-area"
                        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                    >
                        <input
                            type="text"
                            className="chatbot-input"
                            placeholder="Ask a question..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" className="chatbot-send-btn">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            ) : (
                <button
                    className="chatbot-button"
                    onClick={() => {
                        setIsOpen(true);
                        setRole(localStorage.getItem('user_role') || 'General');
                    }}
                >
                    <MessageCircle size={28} />
                </button>
            )}
        </div>
    );
}
