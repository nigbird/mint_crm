'use client'

import { toast } from "@/hooks/use-toast"

export function triggerInAppNotification(message: string) {
  toast({
    title: "New Notification",
    description: message,
    duration: 5000,
  })
}

export function simulateEmailToast(to: string, subject: string) {
  toast({
    title: "Email Sent (Simulated)",
    description: `Email to ${to} with subject "${subject}" has been simulated.`,
  })
}

export function simulateSmsToast(to: string) {
  toast({
    title: "SMS Sent (Simulated)",
    description: `SMS to ${to} has been simulated.`,
  })
}

export function simulateCallToast(to: string) {
  toast({
    title: "Call Made (Simulated)",
    description: `Call to ${to} has been simulated.`,
  })
}
