"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
}

export function Dialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  maxWidth = "480px",
  footer,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            <RadixDialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="modal-overlay"
              />
            </RadixDialog.Overlay>
            <RadixDialog.Content
              forceMount
              asChild
              aria-describedby={description ? "dialog-desc" : undefined}
            >
              <motion.div
                className="modal-box"
                style={{
                  maxWidth,
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  zIndex: 201,
                }}
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-48%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-48%" }}
                transition={{ type: "spring", stiffness: 380, damping: 26 }}
              >
                <div className="modal-header">
                  <div>
                    {title && (
                      <RadixDialog.Title className="font-heading" style={{ fontSize: "16px", color: "var(--text-primary)", margin: 0 }}>
                        {title}
                      </RadixDialog.Title>
                    )}
                    {description && (
                      <RadixDialog.Description id="dialog-desc" style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                        {description}
                      </RadixDialog.Description>
                    )}
                  </div>
                  <RadixDialog.Close asChild>
                    <button className="modal-close-btn" aria-label="Close dialog">
                      <X size={14} />
                    </button>
                  </RadixDialog.Close>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
              </motion.div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxWidth="400px"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => { onCancel?.(); onOpenChange(false); }}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            size="sm"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div />
    </Dialog>
  );
}

// ── Delete Dialog ─────────────────────────────────────────────
interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  itemName: string;
  onDelete: () => void;
  loading?: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  title = "Delete Item",
  itemName,
  onDelete,
  loading,
}: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      onConfirm={onDelete}
      confirmLabel="Delete"
      variant="danger"
      loading={loading}
    />
  );
}
