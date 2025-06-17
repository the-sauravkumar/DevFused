"use server";

import * as z from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

interface FormSubmissionResult {
  success: boolean;
  message?: string;
}

export async function submitContactForm(
  data: z.infer<typeof contactFormSchema>
): Promise<FormSubmissionResult> {
  try {
    const validatedData = contactFormSchema.parse(data);
    // In a real application, you would send an email, save to a database, etc.
    // For this example, we'll just log it to the console.
    console.log("Contact form submission received:");
    console.log("Name:", validatedData.name);
    console.log("Email:", validatedData.email);
    console.log("Message:", validatedData.message);

    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, message: "Message sent successfully!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Construct a user-friendly error message from Zod errors
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
      return { success: false, message: `Validation failed: ${errorMessages}` };
    }
    console.error("Error submitting contact form:", error);
    return { success: false, message: "An unexpected error occurred while sending the message." };
  }
}
