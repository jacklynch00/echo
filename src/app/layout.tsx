import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FlowgladProvider } from '@flowglad/nextjs';
import { createServerComponentClient } from '@/lib/supabase-server';

const inter = Inter({
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Voice Notes for the Dead",
	description: "Create AI-powered conversations with loved ones who have passed away. Preserve their voice and continue meaningful conversations.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const supabase = await createServerComponentClient()
	const {
		data: { user }
	} = await supabase.auth.getUser()

	console.log("hello", !!user, user)
	return (
		<html lang="en">
			<body className={`${inter.className} antialiased`}>
				<FlowgladProvider loadBilling={!!user}>
					{children}
				</FlowgladProvider>
			</body>
		</html>
	);
}
