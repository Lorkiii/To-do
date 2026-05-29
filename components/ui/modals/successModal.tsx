"use client";

import React from "react";
import {
  Dialog,
  DialogClose,
  DialogTrigger,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HiCheckCircle } from "react-icons/hi";

type SuccessModalProps = {
  title: string;
  description: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const SuccessModal = ({
  title,
  description,
  trigger,
  open,
  onOpenChange,
}: SuccessModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <div className="relative mx-auto my-4 flex size-20 items-center justify-center">
            <span className="absolute size-20 rounded-full bg-green-500/10 animate-in fade-in zoom-in-50 duration-300" />
            <span className="absolute size-16 rounded-full border border-green-400/30 animate-ping" />
            <span className="absolute left-2 top-3 size-1.5 rounded-full bg-green-300 animate-in fade-in zoom-in-50 slide-in-from-bottom-2 duration-700" />
            <span className="absolute right-3 top-5 size-2 rounded-full bg-emerald-300 animate-in fade-in zoom-in-50 slide-in-from-left-2 duration-700" />
            <span className="absolute bottom-3 left-5 size-2 rounded-full bg-cyan-300 animate-in fade-in zoom-in-50 slide-in-from-top-2 duration-700" />
            <button
              type="button"
              aria-label="Success confirmation"
              className="group/success relative flex size-14 items-center justify-center rounded-full bg-green-500/10 text-green-400 ring-1 ring-green-400/35 transition duration-200 hover:scale-105 hover:bg-green-500/15 hover:text-green-300 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-green-400/30 active:scale-95">
              <span className="absolute size-14 rounded-full bg-green-400/20 opacity-0 transition group-hover/success:animate-ping group-hover/success:opacity-100 group-focus-visible/success:animate-ping group-focus-visible/success:opacity-100" />
              <HiCheckCircle className="relative z-10 h-10 w-10 animate-in zoom-in-50 spin-in-12 duration-500 group-hover/success:scale-110 group-hover/success:rotate-6 group-focus-visible/success:scale-110 group-focus-visible/success:rotate-6" />
            </button>
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="w-full">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
