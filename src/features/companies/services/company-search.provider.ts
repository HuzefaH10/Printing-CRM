import { SearchProvider, SearchResult } from "@/services/search.service";
import { companyRepo } from "./company.repository";

export const CompanySearchProvider: SearchProvider = {
  name: "Companies",
  search: async (query: string): Promise<SearchResult[]> => {
    // In a real application, Firebase Client SDK is terrible at fuzzy search.
    // We would use an external service like Algolia or Meilisearch.
    // For this demonstration on Firebase Client SDK, we do a simple string matching 
    // against a few fields by loading a limited dataset, or using the >= operator on name.
    
    // As a rudimentary approach for the foundation:
    const { data: companies } = await companyRepo.list([
      { field: "name", operator: ">=", value: query },
      { field: "name", operator: "<=", value: query + "\uf8ff" }
    ], { limit: 10 });

    return companies.map(company => ({
      id: company.id,
      type: "company",
      title: company.name,
      description: `${company.industry} • ${company.location.city}, ${company.location.country}`,
      url: `/companies/${company.id}`,
      score: company.intelligence?.overallScore || 0
    }));
  }
};
