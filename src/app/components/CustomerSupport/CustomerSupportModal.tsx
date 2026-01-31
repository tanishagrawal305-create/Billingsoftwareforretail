import React, { useState } from 'react';
import { X, Mail, Phone, MessageCircle, Send, HelpCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerSupportModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({ isOpen = true, onClose }) => {
  const [activeTab, setActiveTab] = useState<'contact' | 'ticket' | 'faq'>('contact');
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  if (!isOpen) return null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketForm.name || !ticketForm.email || !ticketForm.subject || !ticketForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    // Save ticket to localStorage
    const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]');
    const newTicket = {
      ...ticketForm,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    tickets.push(newTicket);
    localStorage.setItem('support_tickets', JSON.stringify(tickets));

    toast.success('Support ticket submitted successfully! We will contact you soon.');
    setTicketForm({ name: '', email: '', subject: '', message: '' });
    onClose();
  };

  const faqs = [
    {
      question: 'How do I add a new product?',
      answer: 'Go to Products section, click "Add Product" button, fill in the details including name, category, stock, and GST rate, then save.',
    },
    {
      question: 'How to manage weight-based products?',
      answer: 'When adding a product, select "Weight" type and choose the unit (kg, g, ltr, ml). During billing, you can enter custom weights for each sale.',
    },
    {
      question: 'How do I generate bills?',
      answer: 'Go to Billing/POS page, add products to cart, enter customer details (optional), select payment method, and click "Complete Sale". You can then print the bill.',
    },
    {
      question: 'How to track daily sales?',
      answer: 'Check the Dashboard for today\'s sales overview, or go to Reports section for detailed daily, weekly, monthly, and yearly reports with date filters.',
    },
    {
      question: 'What if stock runs out?',
      answer: 'The system will show alerts on the dashboard for low stock items. Go to Inventory section to update stock levels for any product.',
    },
    {
      question: 'How to enable/disable GST?',
      answer: 'On the billing page, use the GST toggle switch to enable or disable GST calculation per customer. GST rates are set per product.',
    },
    {
      question: 'How to update my shop details?',
      answer: 'Go to Settings section where you can update shop name, address, phone number, GST number, and other business details.',
    },
    {
      question: 'Can I send bills to customers?',
      answer: 'Yes! After completing a sale, you can print the bill directly. The printable format includes all shop and customer details.',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Customer Support</h2>
            <p className="text-indigo-100 text-sm">We're here to help you 24/7</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'contact'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Contact Us</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'ticket'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>Submit Ticket</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'faq'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Get in Touch</h3>
                <p className="text-gray-600">Choose your preferred way to reach us</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Support */}
                <a
                  href="mailto:support@jrinvoicemaker.com"
                  className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-xl p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-indigo-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Email Support</h4>
                      <p className="text-sm text-gray-600">24/7 Response</p>
                    </div>
                  </div>
                  <p className="text-indigo-600 font-medium">support@jrinvoicemaker.com</p>
                  <p className="text-xs text-gray-500 mt-2">Click to send an email</p>
                </a>

                {/* Phone Support */}
                <a
                  href="tel:+911234567890"
                  className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-green-500 p-3 rounded-lg group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Phone Support</h4>
                      <p className="text-sm text-gray-600">Mon-Sat: 9AM-6PM</p>
                    </div>
                  </div>
                  <p className="text-green-600 font-medium">+91 123 456 7890</p>
                  <p className="text-xs text-gray-500 mt-2">Click to call now</p>
                </a>
              </div>

              {/* Support Hours */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Support Hours
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday:</span>
                    <span className="font-medium text-gray-800">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday:</span>
                    <span className="font-medium text-gray-800">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday:</span>
                    <span className="font-medium text-gray-800">Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Need immediate help?</strong> Submit a support ticket and we'll get back to you within 2-4 hours during business hours.
                </p>
              </div>
            </div>
          )}

          {/* Ticket Tab */}
          {activeTab === 'ticket' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Submit a Support Ticket</h3>
                <p className="text-gray-600">We'll respond within 2-4 hours</p>
              </div>

              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={ticketForm.name}
                    onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={ticketForm.email}
                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Ticket
                </button>
              </form>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Frequently Asked Questions</h3>
                <p className="text-gray-600">Find quick answers to common questions</p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group"
                  >
                    <summary className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-800 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span className="flex-1">{faq.question}</span>
                    </summary>
                    <div className="px-4 py-3 bg-white border-t border-gray-200">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mt-6">
                <p className="text-sm text-indigo-800">
                  <strong>Still have questions?</strong> Contact us directly via email or phone, or submit a support ticket.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};