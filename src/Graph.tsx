import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
        // we needed to add price_abc and price_def because we need these to get the ratio
        price_abc: 'float',
        price_def: 'float',
        ratio: 'float',
        timestamp: 'date',
        // we do not want to distinguish between the two stocks now
        // we want to track their ratios now.
        //stock: 'string',
        //top_ask_price: 'float',
        //top_bid_price: 'float',
        upper_bound: 'float',
        // we also want to track the upper bounds and lower bounds and the trigger alert
        // trigger alert is when these bounds are crossed
        lower_bound: 'float',
        trigger_alert: 'float',
        // we are tracking all of this in respect to time
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
        //elem.setAttribute('column', '["timestamp"]');
        // removed column pinvots which allowed us to distinguish/split
        // stock ABC with DEF in task 2
        // this was removed becasue we are concerned about 
        //the ratios between two stocks and not their separate prices
        elem.setAttribute('row-pivots', '["timestamp"]');
        // we need this so the x-axis isnt blank
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
        // this allows us to focus on a particular part of a datapoint along
        // the y-axis. W/o this the graph will plot all the fields and values 
        // of each datapoint and it will be a lot of noise
        // for this case we want to track ratio,lower_bound upper_bound, and 
        // trigger_alert
        elem.setAttribute('aggregates', JSON.stringify({
            // aggregates allows us to handle the cases of duplicated data we saw
            // in task 2 and we consolidated them as just one data point
            // in task 3 we are only considering a data point unique if it has a time stamp
            // otherwise we will average out the all the values of the other non unique fields
            // these 'similar' datapoint before treating them as one (e.g. ratio,price_abc, ...)
        //stock: 'distinctcount',
          price_abc: 'avg',
          price_def: 'avg',
            ratio: 'avg',
            timestamp: 'distinct count',
          upper_bound: 'avg',
            lower_bound: 'avg',
          trigger_alert: 'avg',
        //top_ask_price: 'avg',
        //top_bid_price: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ]);
    }
  }
}

export default Graph;
