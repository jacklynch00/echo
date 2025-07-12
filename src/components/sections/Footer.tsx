'use client';

import Link from 'next/link';
import { MessageCircle, Heart, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
	const footerLinks = {
		product: [
			{ name: 'How it works', href: '#how-it-works' },
			{ name: 'Pricing', href: '#pricing' },
			{ name: 'Features', href: '#features' },
			{ name: 'Security', href: '/security' },
		],
		support: [
			{ name: 'Help Center', href: '/help' },
			{ name: 'Contact Us', href: '/contact' },
			{ name: 'Privacy Policy', href: '/privacy' },
			{ name: 'Terms of Service', href: '/terms' },
		],
		company: [
			{ name: 'About', href: '/about' },
			{ name: 'Blog', href: '/blog' },
			{ name: 'Careers', href: '/careers' },
			{ name: 'Press', href: '/press' },
		],
	};

	return (
		<footer className='bg-card border-t border-border relative overflow-hidden'>
			{/* Dot Grid Background */}
			<div
				className='absolute inset-0 opacity-30'
				style={{
					backgroundImage: `radial-gradient(circle, hsl(var(--muted)) 1px, transparent 1px)`,
					backgroundSize: '32px 32px',
				}}
			/>

			<div className='container mx-auto px-6 relative'>
				{/* Footer Content */}
				<div className='py-12 border-t border-border'>
					<div className='grid md:grid-cols-4 gap-8 mb-12'>
						{/* Brand Section */}
						<div className='space-y-4'>
							<div className='flex items-center gap-2'>
								<MessageCircle className='w-8 h-8 text-primary' />
								<span className='text-2xl font-bold text-card-foreground'>echo</span>
							</div>

							<p className='text-muted-foreground text-sm leading-relaxed'>
								Preserving voices, creating connections, and bringing comfort through AI-powered conversations with loved ones.
							</p>

							<div className='flex items-center gap-2 text-sm text-muted-foreground'>
								<Heart className='w-4 h-4 text-red-500' />
								<span>Made with love for remembrance</span>
							</div>
						</div>

						{/* Product Links */}
						<div>
							<h3 className='font-semibold text-card-foreground mb-4'>Product</h3>
							<ul className='space-y-2'>
								{footerLinks.product.map((link) => (
									<li key={link.name}>
										<Link href={link.href} className='text-muted-foreground hover:text-primary transition-colors text-sm'>
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Support Links */}
						<div>
							<h3 className='font-semibold text-card-foreground mb-4'>Support</h3>
							<ul className='space-y-2'>
								{footerLinks.support.map((link) => (
									<li key={link.name}>
										<Link href={link.href} className='text-muted-foreground hover:text-primary transition-colors text-sm'>
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Company Links */}
						<div>
							<h3 className='font-semibold text-card-foreground mb-4'>Company</h3>
							<ul className='space-y-2'>
								{footerLinks.company.map((link) => (
									<li key={link.name}>
										<Link href={link.href} className='text-muted-foreground hover:text-primary transition-colors text-sm'>
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Bottom Section */}
					<div className='flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-border'>
						<div className='text-sm text-muted-foreground mb-4 sm:mb-0'>© 2024 Echo. All rights reserved. Preserving memories with care.</div>

						{/* Social Links */}
						<div className='flex items-center gap-4'>
							<Link href='https://twitter.com/echo' className='text-muted-foreground hover:text-primary transition-colors' aria-label='Twitter'>
								<Twitter className='w-5 h-5' />
							</Link>
							<Link href='https://github.com/echo' className='text-muted-foreground hover:text-primary transition-colors' aria-label='GitHub'>
								<Github className='w-5 h-5' />
							</Link>
							<Link href='mailto:hello@echo.com' className='text-muted-foreground hover:text-primary transition-colors' aria-label='Email'>
								<Mail className='w-5 h-5' />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
