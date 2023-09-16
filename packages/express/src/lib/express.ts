import { StanzaGuardOptions, stanzaGuard, Tag, StanzaGuardError } from '@getstanza/node';
import {type Request, type Response, type NextFunction} from 'express'

export function expressStanzaGuard (options: StanzaGuardOptions, requestParser?: ((req: Request) => { feature?: string
    priorityBoost?: number
    tags?: Tag[]})) {
    return function (req: Request, res: Response, next: NextFunction) {
        let { guard, priorityBoost, feature, tags} = options;
        if(requestParser) {
           const parsedRequest = requestParser(req);
           priorityBoost = parsedRequest.priorityBoost ?? priorityBoost;
           feature = parsedRequest.feature ?? feature;
           tags = parsedRequest.tags ?? tags;
        } 
        console.log(`feature ${feature}, boost ${priorityBoost}, tags ${JSON.stringify(tags)}`)
        void stanzaGuard({
        guard,
        priorityBoost,
        feature,
        tags
        }).call(next).catch(next)
  }
}

export function stanzaErrorHandler (err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof StanzaGuardError) {
      res.status(429).send('Too many requests')
    } else {
      next(err)
    }
  }