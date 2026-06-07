"use client";

import { useState } from "react";
import { Add01Icon, BloggerIcon, Task01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { AddTaskModal } from "@/components/features/tasks/addTaskModal";
import { AddBlogPostModal } from "@/components/features/blog/addBlogPostModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FloatingCreateMenu() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [blogPostModalOpen, setBlogPostModalOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Create new item"
            size="icon-lg"
            className="fixed bottom-28 right-4 z-50 size-14 rounded-full bg-primary text-primary-foreground shadow-xl transition hover:bg-primary/90 md:bottom-8 md:right-8"
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-6" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="top"
          sideOffset={12}
          className="w-52 rounded-xl"
        >
          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-lg"
            onClick={() => setTaskModalOpen(true)}
          >
            <HugeiconsIcon icon={Task01Icon} strokeWidth={2} className="size-4" />
            Add task
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2 rounded-lg"
            onClick={() => setBlogPostModalOpen(true)}
          >
            <HugeiconsIcon icon={BloggerIcon} strokeWidth={2} className="size-4" />
            Add blog post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddTaskModal 
      open={taskModalOpen} 
      onOpenChange={setTaskModalOpen} 
      />

      <AddBlogPostModal
        open={blogPostModalOpen}
        onOpenChange={setBlogPostModalOpen}
      />
    </>
  );
}
