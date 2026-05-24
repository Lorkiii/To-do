import React from "react";
import { Button } from "./ui/button";
import { HiCheckCircle } from "react-icons/hi";

import SuccessModal from "./ui/modals/successModal";

export const CheckBtn = () => {
  return (
    <SuccessModal
      title="Success"
      description="Your account has been created successfully"
      trigger={
        <Button type="button" size="icon" aria-label="Show success message">
          <HiCheckCircle className="h-4 w-4" />
        </Button>
      }
    />
  );
};
