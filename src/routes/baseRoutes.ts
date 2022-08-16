export default class BaseRoutes {
  public controller: any;

  public authMiddleware: any;

  constructor(controller: any, authMiddleware: any) {
    this.controller = controller;
    this.authMiddleware = authMiddleware;
  }
}
