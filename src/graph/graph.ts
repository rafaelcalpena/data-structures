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

type CollectionChangeList = Collection;

interface IChangeLog {
  nodes: CollectionChangeList;
  edges: CollectionChangeList;
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

  public static fromEmpty() {
    return Graph.fromObject({
      edges: [],
      nodes: [],
    });
  }

  /* TODO: add wrapper for bind functions */
  public nodes = {
    /** Adds a new Node to the Graph.
     * Will throw an error if Node already exists
     */
    add: ((item: any): Graph => {
      const {nodes, edges} = this.internal;
      if (this.nodes.hasId(item.id)) {
        throw new Error (
          `Could not add Node to Graph: Node already exists`,
        );
      }
      return new Graph({
        edges,
        nodes: nodes.add(item),
      });
    }).bind(this),

    /** Finds one item in Nodes that satifies the query provided */
    findOne: ((query) => {
      const {nodes, edges} = this.internal;
      return nodes.findOne(query);
    }).bind(this),

    /** Removes a Node from the Graph.
     * Will throw an error if Node does not exist in Graph
     */
    remove: ((item: any): Graph => {
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

    /**
     * Adds Nodes Graphs and keeps Edges as is for "this" Graph
     * If you would like to add Edges as well, please use Graph.union()
     */
    union : ((g2: Graph): Graph => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges,
        nodes: nodes.union(g2.nodes.getAll()),
      });
    }).bind(this),

    /** Returns Nodes as Collection Type instead of Graph */
    getAll : ((): Collection => {
      return this.internal.nodes;
    }).bind(this),

    getByHash: ((hash): any => {
      return this.internal.nodes.getByHash(hash);
    }).bind(this),

    getByIdHash: ((hash): any => {
      return this.internal.nodes.getByIdHash(hash);
    }).bind(this),

    /** Update a Node from the Graph.
     * This method will update only one matching Node.
     * Query must be exactly equal to the Node. If you'd like to
     * query only by "id" property, please use updateId()
     */
    update: ((item, newItem): Graph  => {
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

    /** Updates a Node from Graph by querying its id */
    /* TODO: Move to Collection */
    updateId: ((id, newItem) => {
      const {nodes, edges} = this.internal;
      const item = nodes.findOne({id});
      if (!item) {
        throw new Error (
          `Could not update Node from Graph: Node does not exist`,
        );
      }
      /* Performance improvement */
      if (SSet.hashOf(item) === SSet.hashOf(newItem)) {
        return this;
      }
      return new Graph({
        edges,
        nodes: nodes.remove(item).add(newItem),
      });
    }).bind(this),

    /** Check if a given item is contained in the Graph Nodes
     * Query must be exactly equal to the Node. If you'd like to
     * query only by "id" property, please use hasId()
     */
    has: ((item): boolean => {
      return this.internal.nodes.has(item);
    }).bind(this),

    /** Gets Node by querying its id
     * If Node Id does not exist in Graph, will throw an error.
     */
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

    /** Check if a given item id is contained in the Graph Nodes */
    hasId : ((id: any) => {
      const {nodes, edges} = this.internal;
      if (id === undefined) {
        return false;
      }
      const maybeNode = nodes.findOne({id});
      return (typeof maybeNode !== 'undefined') ? true : false;
    }).bind(this),

    /** Get one Node that contains an incoming edge from id supplied */
    oneReachedById: ((id) => {
      const edgesGraph = this.edges.fromId(id);
      if (edgesGraph.edges.isEmpty()) {
        return;
      }
      const edge = edgesGraph.edges.getAll().getOne();
      return this.nodes.getId(edge.to);
    }).bind(this),

    /* Get all Nodes that contain an incoming edge from id supplied
     * Return does not contain Edges
     */
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

    /** Find Nodes that satisfy a given query. Exactly matches one-level-deep
     * property indexes, such as "id".
     * If you would like to run a complex query, please use filter() instead
     * Return does not contain Edges.
     */
    find: ((query) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges: Collection.fromArray([]),
        nodes: nodes.find(query),
      });
    }).bind(this),

    /** Run a query function against all Nodes and return the ones that pass the test
     * Return does not contain Edges
     */
    filter: ((query) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges: Collection.fromArray([]),
        nodes: nodes.filter(query),
      });
    }).bind(this),

    /** Run a function against all Nodes */
    forEach: ((fn) => {
      const {nodes, edges} = this.internal;
      nodes.forEach(fn);
    }).bind(this),

    /** Check whether Graph contains no Nodes */
    isEmpty: (() => {
      return this.internal.nodes.isEmpty();
    }).bind(this),

    /** Get all Nodes that do not have incoming edges
     * Return does not contain edges
     */
    getStartingNodes: (() => {
      const nodesWithoutIncidentEdges = (i, hash, itemMetadata) => {
        const nodeIdHash = itemMetadata.getOne('id');
        const itemHash = this.edges.findOneHash({
          to: nodeIdHash,
        }) === undefined;
        return itemHash;
      };
      return this.nodes.filter(nodesWithoutIncidentEdges);
    }).bind(this),

    removeEdgesFromNodes: ((graph, nodesGraph: Graph): Graph => {
      /* Remove levelNodes from graph */
      const graphWithoutLevelNodes = graph.nodes.difference(nodesGraph);

      /* Remove edges attached to removed nodes */
      /* TODO: Abstract step into custom method */
      const nodesCollection = nodesGraph.nodes.getAll();
      let graphWithoutEdges = graphWithoutLevelNodes;
      const hashes = [];

      const addToHashesQueue = (item, hash, itemMetadata) => {
        hashes.push(itemMetadata.getOne('id'));
      };
      nodesCollection.forEach(addToHashesQueue);

      graphWithoutEdges = graphWithoutEdges.edges.findAndDifferenceHash({
        from: hashes,
      });

      return graphWithoutEdges;
    }).bind(this),

    /** Sort Nodes topologically.
     * Return contains an Array of Graphs that do not contain Edges
     */
    topologicalSort: (() => {
      /* TODO: Add cycle detection */
      const step = (graph, arr = []) => {
        if (graph.nodes.isEmpty()) {
          return arr;
        }
        /* Get Nodes without Incoming Edges - "Starting" nodes */
        const levelNodes = graph.nodes.getStartingNodes();
        const graphWithoutLevelEdges = this.nodes.removeEdgesFromNodes(graph, levelNodes);
        return step(
          graphWithoutLevelEdges,
          [...arr, levelNodes],
        );
      };

      return step(this);

    }).bind(this),

    /** Get the Nodes difference between two Graphs.
     * Edges remain unaltered for "this" Graph
     */
    difference: ((g2: Graph) => {
      const {nodes, edges} = this.internal;
      const result = nodes.difference(g2.nodes.getAll());
      /* Performance optimization */
      if (result === nodes) {
        return this;
      }
      return new Graph({
        edges,
        nodes: result,
      });
    }).bind(this),

    /** Gets the number of Nodes in the Graph */
    size: (() => {
      return this.internal.nodes.size();
    }).bind(this),

    /** Iterator for Nodes. Can be used in for ... of loops, for example */
    [Symbol.iterator]: (() => {
      return this.internal.nodes[Symbol.iterator]();
    }).bind(this),

  };

  public edges = {
    /**
     * Adds Edges Graphs and keeps Nodes as is for "this" Graph
     * If you would like to add Nodes as well, please use Graph.union()
     */
    union : ((g2: Graph) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges: edges.union(g2.edges.getAll()),
        nodes,
      });
    }).bind(this),

    /** Get the Edges difference between two Graphs.
     * Nodes remain unaltered for "this" Graph
     */
    difference: ((g2: Graph) => {
      const {nodes, edges} = this.internal;
      const result = edges.difference(g2.edges.getAll());
      /* Performance optimization */
      if (result === edges) {
        return this;
      }
      return new Graph({
        edges: result,
        nodes,
      });
    }).bind(this),

    /** Maps Edges to a new Graph
     * Resulting Graph keep Nodes unaltered
     */
    map: ((fn) => {
      const {nodes, edges} = this.internal;

      return new Graph({
        edges: edges.map(fn),
        nodes,
      });
    }).bind(this),

    /** Run a query function against all Edges and return the ones that pass the test
     * Return does not contain Nodes
     */
    filter: ((query) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges: edges.filter(query),
        nodes: Collection.fromArray([]),
      });
    }).bind(this),

    /** Find Edges that satisfy a given query. Exactly matches one-level-deep
     * property indexes, such as "id".
     * If you would like to run a complex query, please use filter() instead
     * Return does not contain Nodes.
     */
    find: ((query) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges: edges.find(query),
        nodes: Collection.fromArray([]),
      });
    }).bind(this),

    findHash: ((query) => {
      const {nodes, edges} = this.internal;
      return new Graph({
        edges: edges.findHash(query),
        nodes: Collection.fromArray([]),
      });
    }).bind(this),

    /** Shortcut method for piping Edges.find() => Edges.difference */
    findAndDifference: ((query) => {
      return this.edges.difference(this.edges.find(query));
    }).bind(this),

    /** Shortcut method for piping Edges.find() => Edges.difference */
    findAndDifferenceHash: ((query) => {
      const z = this.edges.findHash(query);
      const d = this.edges.difference(z);

      return d;
    }).bind(this),

    /** Iterate on all Edges */
    forEach: ((fn) => {
      const {nodes, edges} = this.internal;
      edges.forEach(fn);
    }).bind(this),

    /** Returns Edges as Collection Type instead of Graph */
    getAll : (() => {
      return this.internal.edges;
    }).bind(this),

    getByHash: ((hash): any => {
      return this.internal.edges.getByHash(hash);
    }).bind(this),

    getByIdHash: ((hash): any => {
      return this.internal.edges.getByIdHash(hash);
    }).bind(this),

   /** Given an edge, will check if its ID is present in the graph.
    * If so, will remove the edge from the graph.
    * If not, will add the edge to the graph
    */
    toggle: ((item) => {
      const {nodes, edges} = this.internal;

      if (this.edges.hasId(item.id)) {
        return this.edges.remove(item);
      } else {
        return this.edges.add(item);
      }
    }).bind(this),

    /** Removes an Edge from the Graph.
     * Will throw an error if Edge does not exist in Graph
     */
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

    /** Adds a new Edge to the Graph.
     * Will throw an error if Edge already exists
     */
    add: ((item: any) => {
      const {nodes, edges} = this.internal;
      if (this.edges.hasId(item.id)) {
        throw new Error (
          `Could not add Edge to Graph: Edge Id already exists`,
        );
      }
      return new Graph({
        edges: edges.add(item),
        nodes,
      });
    }).bind(this),

    /** Updates an Edge from the Graph.
     * This method will update only one matching Edge.
     * Query must be exactly equal to the Edge. If you'd like to
     * query only by "id" property, please use updateId()
     */
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

    /** Updates an Edge from Graph by querying its id */
    updateId: ((id, newItem) => {
      const {nodes, edges} = this.internal;
      const item = edges.findOne({id});
      if (!item) {
        throw new Error (
          `Could not update Edge from Graph: Edge does not exist`,
        );
      }
      /* Performance improvement */
      if (SSet.hashOf(item) === SSet.hashOf(newItem)) {
        return this;
      }
      return new Graph({
        edges: edges.remove(item).add(newItem),
        nodes,
      });
    }).bind(this),

    /** Checks whether id is contained in Graph Edges */
    hasId : ((id: any) => {
      const {nodes, edges} = this.internal;
      if (id === undefined) {
        return false;
      }
      const maybeNode = edges.findOne({id});
      return (typeof maybeNode !== 'undefined') ? true : false;
    }).bind(this),

    /** Gets All Edges that have "from" property set to given id
     * Return does not contain Nodes
     */
    fromId: ((from) => {
      const {nodes, edges} = this.internal;
      return new Graph ({
        edges: edges.find({from}),
        nodes: Collection.fromArray([]),
      });
    }).bind(this),

    /** Iterator for Edges. Can be used in for ... of loops, for example */
    [Symbol.iterator]: (() => {
      return this.internal.edges[Symbol.iterator]();
    }).bind(this),

    /** Finds one item in Edges that satifies the query provided */
    findOne: ((query) => {
      const {nodes, edges} = this.internal;
      return edges.findOne(query);
    }).bind(this),

    /** Finds one item in Edges that satifies the query provided */
    findOneHash: ((query) => {
      const {nodes, edges} = this.internal;
      return edges.findOneHash(query);
    }).bind(this),

    /** Gets the number of Edges in the Graph */
    size: (() => {
      return this.internal.edges.size();
    }).bind(this),

    /** Check whether Graph contains no Edges */
    isEmpty: (() => {
      return this.internal.edges.isEmpty();
    }).bind(this),

    /** Gets Edge by querying its id
     * If Edge Id does not exist in Graph, will throw an error.
     */
    getId : ((id: any) => {
      const {edges} = this.internal;
      const maybeEdge = edges.findOne({id});
      if (_.isUndefined(maybeEdge)) {
        throw new Error (
          `Could not get Edge: Edge Id '${id}' does not exist in Graph`,
        );
      }
      return maybeEdge;
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

  public changesFrom(graph2: Graph): IChangeLog {
    /* Changes are based on "id" field, which must be unique */
    const {nodes, edges} = this.internal;

    return {
      edges: edges.changesFrom(graph2.edges.getAll()),
      nodes: nodes.changesFrom(graph2.nodes.getAll()),
    };
  }

  public changesTo(graph2: Graph): IChangeLog {
    return graph2.changesFrom(this);
  }

  public _getSignature = () => '@labshare/data-structures/graph';
}
