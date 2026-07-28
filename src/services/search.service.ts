export interface SearchResult {
  id: string;
  type: string; // e.g. "company", "contact", "quote"
  title: string;
  description?: string;
  url: string;
  score?: number;
}

export interface SearchProvider {
  name: string;
  search: (query: string) => Promise<SearchResult[]>;
}

class SearchService {
  private providers: SearchProvider[] = [];

  /**
   * Register a new search provider for a module
   */
  registerProvider(provider: SearchProvider) {
    this.providers.push(provider);
  }

  /**
   * Search across all registered providers
   */
  async globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const searchPromises = this.providers.map(provider => 
      provider.search(query).catch(err => {
        console.error(`Search failed in provider ${provider.name}:`, err);
        return [];
      })
    );

    const resultsArray = await Promise.all(searchPromises);
    
    // Flatten and sort by score (if available)
    const flatResults = resultsArray.flat();
    return flatResults.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
}

export const globalSearchService = new SearchService();
