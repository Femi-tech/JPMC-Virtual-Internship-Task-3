import { ServerRespond } from './DataStreamer';

export interface Row {
    price_abc: number,
    price_def: number,
    ratio: number,
    upper_bound: number,
    lower_bound: number,
    //stock: string,
  //top_ask_price: number,
    timestamp: Date,
    trigger_alert: number | undefined,
    // these changes are necessary because it 
    // will be the structure of the return object of the only function of the DataManipulator
    // class, i.e. the generateRow function.
    // it is important the that return object corresponds to the schema of the table well be 
    // updating in the Graph component becasue thats the only way that we'll be able
    // to display the right output we want
}


export class DataManipulator {
    // we need to update the generateRow function of the DataManipulator class to properly
    // process the raw server data passed to it so that it can return the processed data 
    //whcih will be rendered by the Graph's  component table.
  static generateRow(serverRespond: ServerRespond[]): Row {
      const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
      const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;
      const ratio = priceABC / priceDEF;
      const upperBound = 1 + 0.05;
      const lowerBound = 1 - 0.05;
      //return serverResponds.map((el: any) => {
      return {
          price_abc: priceABC,
          price_def: priceDEF,
          ratio,
          timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ?
              serverRespond[0].timestamp : serverRespond[1].timestamp,
          //stock: el.stock,
        //top_ask_price: el.top_ask && el.top_ask.price || 0,
        //timestamp: el.timestamp,
          upper_bound: upperBound,
          lower_bound: lowerBound,
          trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
      };
      // we are able to access serverRespond as an array where in the first element (0-index) is about stock ABC and
      // the second element(1-index) about stock DEF.
      // with this we were able to easily just plug in values to the formulas we used back in task 1
      // to computes the prices and ratio properly
      // return values was cahnged from a Row objects to just a single Row object. 
      // this change explains why we also adjusted the arguments we passed tp table.update in Graph.tsx earlier so that
      // consistency is preserved. 
      // upper bound and lower bound are constant for an data point
  }
}
