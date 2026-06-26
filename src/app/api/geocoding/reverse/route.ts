import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryStr = searchParams.toString();

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${queryStr}`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'Project-Zenith/1.0'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from Nominatim' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('CORS Proxy Reverse Geocoding Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
