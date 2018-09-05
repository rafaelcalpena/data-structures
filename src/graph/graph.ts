import * as _ from 'lodash';
import {Collection} from '../collection/collection';
import {SSet} from '../sset/sset';

/* TODO: Only accept stringify-capable params for type */
interface IGraphObjectNode {
  id?: any;
  labels?: any[] | SSet | Collection;
  [s: string]: any;
}

interface IGraphObjectEdge {
  id?: any;
  from: any;
  to: any;
  labels?: any[] | SSet | Collection;
  [s: string]: any;
}

interface IGraphObject {
  nodes: IGraphObjectNode[];
  edges: IGraphObjectEdge[];
}

interface InternalState {
  nodes: Collection;
  edges: Collection;
}

export class Graph {

  public static fromObject(obj: IGraphObject) {
    const {nodes, edges} = obj;
    const nodesCollection = Collection.fromArray(nodes);
    const edgesCollection = Collection.fromArray(edges);
    return new Graph({
      edges: edgesCollection,
      nodes: nodesCollection,
    });
  }

  /* TODO: add wrapper for bind functions */
  public nodes = {
    add: ((item: any) => {
      const {nodes, edges} = this.internal;
      if (nodes.has(item)) {
        throw new Error (
          `Could not add Node from Graph: Node already exists`,
        );
      }
      return new Graph({
        edges,
        nodes: nodes.add(item),
      });
    }).bind(this),

    remove: ((item: any) => {
      const {nodes, edges} = this.internal;
      if (!nodes.has(item)) {
        throw new Error (
          `Could not remove Node from Graph: Node does not exist`,
        );
      }
      return new Graph({
        edges,
        nodes: nodes.remove(item),
      });
    }).bind(this),

    union : ((g2: Graph) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges,
        nodes: nodes.union(g2.nodes.getAll()),
      });
    }).bind(this),

    getAll : (() => {
      return this.internal.nodes;
    }).bind(this),

    update: ((item, newItem)  => {
      const {nodes, edges} = this.internal;
      if (!nodes.has(item)) {
        throw new Error (
          `Could not update Node from Graph: Node does not exist`,
        );
      }
      return new Graph({
        edges,
        nodes: nodes.remove(item).add(newItem),
      });
    }).bind(this),

    getId : ((id: any) => {
      const {nodes, edges} = this.internal;
      const maybeNode = nodes.findOne({id});
      if (_.isUndefined(maybeNode)) {
        throw new Error (
          `Could not get Node: Node Id '${id}' does not exist in Graph`,
        );
      }
      return maybeNode;
    }).bind(this),

    hasId : ((id: any) => {
      const {nodes, edges} = this.internal;
      const maybeNode = nodes.findOne({id});
      return (typeof maybeNode !== 'undefined') ? true : false;
    }).bind(this),

    oneReachedById: ((id) => {
      const edgesGraph = this.edges.fromId(id);
      const edge = edgesGraph.edges.getAll().getOne();
      return this.nodes.getId(edge.to);
    }).bind(this),

    reachedById: ((id) => {
      const edgesGraph = this.edges.fromId(id);
      const nodes = edgesGraph.internal.edges.map((edge) => {
        return this.nodes.getId(edge.to);
      });

      return new Graph({
        edges: Collection.fromArray([]),
        nodes,
      });
    }).bind(this),

    find: ((query) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        nodes: nodes.find(query),
        edges: Collection.fromArray([])
      });
    }).bind(this),

    [Symbol.iterator]: (() => {
      return this.internal.nodes[Symbol.iterator]();
    }).bind(this),

  };

  public edges = {
    union : ((g2: Graph) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges: edges.union(g2.edges.getAll()),
        nodes,
      });
    }).bind(this),

    difference: ((g2: Graph) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges: edges.difference(g2.edges.getAll()),
        nodes,
      });
    }).bind(this),

    map: ((fn) => {
      const {nodes, edges} = this.internal;

      return new Graph({
        edges: edges.map(fn),
        nodes,
      });
    }).bind(this),

    find: ((query) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges: edges.find(query),
        nodes: Collection.fromArray([]),
      });
    }).bind(this),

    findAndDifference: ((query) => {
      return this.edges.difference(this.edges.find(query));
    }).bind(this),

    getAll : (() => {
      return this.internal.edges;
    }).bind(this),

    toggle: ((item) => {
      const {nodes, edges} = this.internal;

      if (this.edges.hasId(item.id)) {
        return this.edges.remove(item);
      } else {
        return this.edges.add(item);
      }
    }).bind(this),

    remove: ((item: any) => {
      const {nodes, edges} = this.internal;
      if (!edges.has(item)) {
        throw new Error (
          `Could not remove Edge from Graph: Edge does not exist`,
        );
      }
      return new Graph({
        edges: edges.remove(item),
        nodes,
      });
    }).bind(this),

    add: ((item: any) => {
      const {nodes, edges} = this.internal;
      if (edges.has(item)) {
        throw new Error (
          `Could not add Edge to Graph: Edge already exists`,
        );
      }
      return new Graph({
        edges: edges.add(item),
        nodes,
      });
    }).bind(this),

    update: ((item, newItem)  => {
      const {nodes, edges} = this.internal;
      if (!edges.has(item)) {
        throw new Error (
          `Could not update Edge from Graph: Edge does not exist`,
        );
      }
      return new Graph({
        edges: edges.remove(item).add(newItem),
        nodes,
      });
    }).bind(this),

    updateId: ((id, newItem) => {
      const {nodes, edges} = this.internal;
      const item = edges.findOne({id});
      if (!item) {
        throw new Error (
          `Could not update Edge from Graph: Edge does not exist`,
        );
      }
      return new Graph({
        edges: edges.remove(item).add(newItem),
        nodes,
      });
    }).bind(this),

    hasId : ((id: any) => {
      const {nodes, edges} = this.internal;
      const maybeNode = edges.findOne({id});
      return (typeof maybeNode !== 'undefined') ? true : false;
    }).bind(this),

    fromId: ((from) => {
      const {nodes, edges} = this.internal;
      return new Graph ({
        edges: edges.find({from}),
        nodes: Collection.fromArray([]),
      });
    }).bind(this),

    [Symbol.iterator]: (() => {
      return this.internal.edges[Symbol.iterator]();
    }).bind(this),

    findOne: ((query) => {
      const {nodes, edges} = this.internal;
      return edges.findOne(query)
    }).bind(this),

    /* TODO: Follow up method, used for Tree Graphs.
    Starting from a given node, will return the path order */

  };

  constructor(private internal: InternalState) {}

  public toObject(): IGraphObject {
    const {nodes, edges} = this.internal;
    return {
      edges: edges.toArray(),
      nodes: nodes.toArray(),
    };
  }

  public union(graph2: Graph): Graph {
    return this.edges.union(graph2).nodes.union(graph2);
  }
}
