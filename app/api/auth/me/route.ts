import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const primaryEmail = user.emailAddresses?.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;

    return NextResponse.json({
      user: {
        id: user.id,
        email: primaryEmail ?? user.emailAddresses?.[0]?.emailAddress ?? null,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        displayName: user.username ? user.username : [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined,
        avatar: user.imageUrl ?? undefined,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
      },
    });
  } catch (err) {
    console.error("/api/auth/me error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
