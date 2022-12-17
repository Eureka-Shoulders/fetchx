export class FetchxError extends Error {
  response: Response;

  constructor(response: Response) {
    super(response.statusText);
    this.name = this.constructor.name;
    this.response = response;
  }
}
