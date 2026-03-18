import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Generate a simple SVG placeholder image
  const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#f3f4f6"/>
      <text x="50" y="50" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="40" fill="#94a3b8">?</text>
    </svg>
  `;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    },
  });
}
