import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FlowgladProvider } from '@flowglad/nextjs';
import { createServerComponentClient } from '@/lib/supabase-server';

const inter = Inter({
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Echo',
	description: 'Create AI-powered conversations with loved ones who have passed away. Preserve their voice and continue meaningful conversations.',
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const supabase = await createServerComponentClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	console.log('hello', !!user, user);
	return (
		<html lang='en'>
			<head>
				<script src='https://planemetrics.com/js/client.js' data-website-id='cc8b7d29-511f-470e-aaf2-6657773bf46c' defer></script>
			</head>
			<body className={`${inter.className} antialiased`}>
				<FlowgladProvider loadBilling={!!user}>{children}</FlowgladProvider>
			</body>
		</html>
	);
}
