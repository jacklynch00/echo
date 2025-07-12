'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<nav className='fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border'>
			<div className='container mx-auto px-6'>
				<div className='flex items-center justify-between h-16'>
					{/* Logo */}
					<Link href='/' className='text-2xl font-bold text-primary'>
						echo
					</Link>

					{/* Desktop Navigation */}
					<div className='hidden md:flex items-center space-x-8'>
						<Link href='#how-it-works' className='text-foreground hover:text-primary transition-colors'>
							How it works
						</Link>
						<Link href='#samples' className='text-foreground hover:text-primary transition-colors'>
							Samples
						</Link>
						<Link href='#faq' className='text-foreground hover:text-primary transition-colors'>
							FAQ
						</Link>
					</div>

					{/* Desktop CTA */}
					<div className='hidden md:flex items-center space-x-4'>
						<Link href='/sign-in' className='text-foreground hover:text-primary transition-colors'>
							Sign in
						</Link>
						<Button asChild className='bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 relative overflow-hidden group'>
							<Link href='/sign-up'>
								<span className='relative z-10'>Sign Up</span>
								<div className='absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300' />
							</Link>
						</Button>
					</div>

					{/* Mobile Menu Button */}
					<button className='md:hidden' onClick={() => setIsMenuOpen(!isMenuOpen)}>
						{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>

				{/* Mobile Navigation */}
				{isMenuOpen && (
					<div className='md:hidden py-4 border-t border-border'>
						<div className='flex flex-col space-y-4'>
							<Link href='#how-it-works' className='text-foreground hover:text-primary transition-colors' onClick={() => setIsMenuOpen(false)}>
								How it works
							</Link>
							<Link href='#samples' className='text-foreground hover:text-primary transition-colors' onClick={() => setIsMenuOpen(false)}>
								Samples
							</Link>
							<Link href='/sign-in' className='text-foreground hover:text-primary transition-colors' onClick={() => setIsMenuOpen(false)}>
								Sign in
							</Link>
							<Link href='#faq' className='text-foreground hover:text-primary transition-colors' onClick={() => setIsMenuOpen(false)}>
								FAQ
							</Link>
							<Button asChild className='bg-primary text-primary-foreground'>
								<Link href='/sign-up' onClick={() => setIsMenuOpen(false)}>
									Sign Up
								</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
