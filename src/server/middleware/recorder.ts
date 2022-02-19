import {RequestHandler} from 'express';
import {redacted} from '../../common/utils/redacted';

export function recorder(): RequestHandler {
  return async (req, res, next) => {
    const {method, path, params, query, body} = req;

    const info = {
      method: method,
      path: path,
      cookies: req.cookies,
      userAgent: req.headers['user-agent'],
      params: redacted(params),
      query: redacted(query),
      body: redacted(body),
    };

    console.log(`요청을 받았습니다: ${JSON.stringify(info)}`);

    next();
  };
}