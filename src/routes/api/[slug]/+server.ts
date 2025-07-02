import { json, error } from '@sveltejs/kit';
import { searchData, sortData } from '$lib/utils/api';
import type { DataItem } from '$lib/utils/api';
import fs from 'fs/promises';
import path from 'path';

const DEFAULT_LIMIT = 50;

export async function GET({ params, url }) {
  const { slug } = params;
  const dataPath = path.resolve('static/data', `${slug}.json`);

  try {
    const file = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(file);

    // Pagination parameters
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10);

    // Search parameter
    const search = url.searchParams.get('search')?.toLowerCase();

    // Sorting parameters
    const sortKey = url.searchParams.get('sortBy');
    const sortDir = url.searchParams.get('direction')?.toLowerCase() === 'desc' ? 'desc' : 'asc';

    let filteredData = data;

    // Search filter
    if (search && Array.isArray(filteredData)) {
      filteredData = searchData(filteredData, search, ['title', 'description'])
    }
    // Sorting
    if (sortKey && Array.isArray(filteredData)) {
      // Only sort if the key exists on the first item (or fallback to string)
      const key = sortKey as keyof DataItem;
      if (filteredData.length > 0 && key in filteredData[0]) {
        filteredData = sortData(filteredData, key, sortDir);
      }
    }

    if (!Array.isArray(filteredData)) {
      // If the data is not an array, return as is (no pagination)
      return json(filteredData);
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filteredData.slice(start, end);

    return json({
      page,
      limit,
      dataType: slug,
      total: filteredData.length,
      totalPages: Math.ceil(filteredData.length / limit),
      items: paginated
    });
  } catch (err: any) {
    throw error(404, `Data file not found for slug: ${slug}, Error: ${err.message}`);
  }
}