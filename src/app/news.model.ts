export interface News {
  // Data about the author
  uid: string,
  email: string,
  username: string,
  // Metadata about the news
  date: string,
  countryCode: string,
  countryName: string,
  // The news itself
  title: string,
  body: string
}
