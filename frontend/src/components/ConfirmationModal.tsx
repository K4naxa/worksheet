"use client";

import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Check, Trash2 } from "lucide-react";
import { useModalEffects } from "@/hooks/useModalEffect";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: React.ReactNode | string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  title = "Vahvistus",
  confirmText = "Kyllä",
  cancelText = "Peruuta",
  variant = "default",
}) => {
  const isDanger = variant === "danger";
  // State for the countdown, only relevant for the danger variant
  const [countdown, setCountdown] = useState(isDanger ? 10 : 0);

  // This useEffect handles the countdown logic
  useEffect(() => {
    // Only run the timer if the modal is open and it's a danger variant
    if (isOpen && isDanger) {
      // Set the initial countdown value when the modal opens
      setCountdown(10);

      const timer = setInterval(() => {
        // Decrement the countdown every second
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      // Cleanup function: this runs when the component unmounts or dependencies change
      return () => {
        clearInterval(timer);
      };
    }
  }, [isOpen, isDanger]); // Rerun this effect if isOpen or isDanger changes

  // This useEffect handles side effects like body scroll and history
  useModalEffects(isOpen, onClose);

  const handleConfirm = () => {
    onConfirm();
    // The parent component is responsible for closing the modal
  };

  if (!isOpen) return null;

  // Determine if the confirm button should be disabled
  const isConfirmDisabled = isDanger && countdown > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`glass-card rounded-2xl w-full max-w-md ${
          isDanger ? "border-2 border-red-500" : ""
        }`}
      >
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDanger ? "border-red-500/20" : "border-white/20"
          }`}
        >
          <div className="flex items-center space-x-2">
            {isDanger ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <Trash2 className="w-5 h-5 text-primary" />
            )}
            <h2
              className={`text-xl font-bold ${
                isDanger ? "text-red-500" : "text-primary"
              }`}
            >
              {title}
            </h2>
          </div>
        </div>

        <div className="p-6">
          <span className="text-primary whitespace-pre-line">{message}</span>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/20">
          <button onClick={onClose} className="btn-secondary">
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled} // <-- Apply the disabled attribute
            className={`font-medium px-6 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 ${
              isDanger
                ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50 disabled:bg-red-500/40 disabled:cursor-not-allowed"
                : "btn-primary"
            }`}
          >
            {/* Show the countdown on the button if it's active */}
            {isConfirmDisabled ? `${confirmText} (${countdown})` : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
