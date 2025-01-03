import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const id = params.userId;

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }

  if (!id) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const data = await request.json();

    // Check if user exists
    const existingUser = await prisma.utilisateur.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData = { ...data }; // Use const instead of let
    if (data.motDePasse) {
      updateData.motDePasse = await hash(data.motDePasse, 10);
    }

    // Update user
    const updatedUser = await prisma.utilisateur.update({
      where: { id },
      data: updateData,
    });

    const { motDePasse: _, ...userWithoutPassword } = updatedUser; // eslint-disable-line @typescript-eslint/no-unused-vars
    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    console.error('Error updating user:', error);

    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const id = params.userId;

  if (!prisma) {
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }

  if (!id) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Check if user exists
    const existingUser = await prisma.utilisateur.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await prisma.utilisateur.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);

    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}