// No `use client` here

export async function sendEmailNotification(to: string, subject: string, body: string) {
  console.log(`[EMAIL] Sending email to: ${to}, Subject: ${subject}, Body: ${body}`)
  // Call an actual email API here if needed.
}

export async function sendSmsNotification(to: string, message: string) {
  console.log(`[SMS] Sending SMS to: ${to}, Message: ${message}`)
  // Integrate with SMS API
}

export async function makeCallNotification(to: string, message: string) {
  console.log(`[CALL] Making call to: ${to}, Message: ${message}`)
  // Integrate with call API
}
