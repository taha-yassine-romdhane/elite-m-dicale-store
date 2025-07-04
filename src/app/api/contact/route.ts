import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendContactFormEmail } from '@/lib/email';

const prisma = new PrismaClient();

// Guest user account ID for all guest messages
const GUEST_USER_ID = 'cm6iok3fw0008bq2klp8oqzak';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { message, user, isGuest } = data;

    if (!message) {
      return NextResponse.json(
        { error: 'Le message est requis' },
        { status: 400 }
      );
    }

    if (!isGuest) {
      // For logged-in users, save with their user ID
      const contact = await prisma.contact.create({
        data: {
          message,
          utilisateurId: user.id,
        },
      });
      
      // Send email notification for logged-in user
      try {
        await sendContactFormEmail({
          name: `${user.prenom || ''} ${user.nom || ''}`.trim(),
          email: user.email,
          phone: user.telephone,
          message: message
        });
        console.log('Contact form email sent successfully');
      } catch (emailError) {
        // Log the error but don't fail the request
        console.error('Error sending contact form email:', emailError);
      }
      
      return NextResponse.json({ success: true, contact });
    } else {
      // For guests, include their details in the message and use guest account
      const guestMessage = `
Message from Guest:
Name: ${user.nom}
Email: ${user.email}
${user.telephone ? `Phone: ${user.telephone}\n` : ''}
Message:
${message}`;

      // Save guest message using the guest user account
      const contact = await prisma.contact.create({
        data: {
          message: guestMessage,
          utilisateurId: GUEST_USER_ID, // Use the guest user account
        },
      });
      
      // Send email notification for guest user
      try {
        await sendContactFormEmail({
          name: user.nom,
          email: user.email,
          phone: user.telephone,
          message: message
        });
        console.log('Contact form email sent successfully');
      } catch (emailError) {
        // Log the error but don't fail the request
        console.error('Error sending contact form email:', emailError);
      }
      
      return NextResponse.json({ success: true, contact });
    }
  } catch (error: unknown) {
    console.error('Error handling contact:', error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi du message" },
      { status: 500 }
    );
  }
}