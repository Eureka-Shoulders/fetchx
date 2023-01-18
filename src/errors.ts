import { RequestInitWithParams } from './types';

export class FetchxError extends Error {
  request: RequestInitWithParams;
  response: Response;

  constructor(request: RequestInitWithParams, response: Response) {
    super(response.statusText);
    this.name = this.constructor.name;
    this.response = response;
    this.request = request;
  }
}
