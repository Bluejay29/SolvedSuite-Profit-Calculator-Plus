import Link from 'next/link';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Profit Calculator', href: '/calculator' },
    { name: 'Product Monitor', href: '/products' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <div className="flex h-screen flex-col bg-navy border-r border-champagne/20 p-6">
      <div className="mb-10">
        <h1 className="font-playfair text-xl font-bold text-champagne leading-tight">
          SolvedSuite<br />
          <span className="text-sm font-inter tracking-widest uppercase text-pearl/60">
            Maker's Profit Hub
          </span>
        </h1>
      </div>

      <nav className="flex-1 space-y-4">
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.href}
            className="block font-inter text-pearl hover:text-sage transition-colors duration-200 text-lg"
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t border-champagne/10">
        <p className="text-xs text-pearl/40 font-inter uppercase tracking-widest">
          Premium Access
        </p>
      </div>
    </div>
  );
}
