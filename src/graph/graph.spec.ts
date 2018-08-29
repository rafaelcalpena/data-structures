import {Graph} from './graph'

describe('graph', () => {
  describe('create', () => {
    it('should create from object', () => {
      let graph, result;
      expect(() => graph = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => result = graph.toObject()).not.toThrow()
      expect(result).toEqual({
        nodes: [],
        edges: []
      })

      expect(() => graph = Graph.fromObject({
        nodes: [
          {
            name: 'Albus',
            lastName: 'Dumbledore'
          },
          {
            name: 'Lucius',
            lastName: 'Malfoy'
          }
        ],
        edges: []
      })).not.toThrow();
      expect(() => result = graph.toObject()).not.toThrow()
      expect(result).toEqual({
        nodes: [
          {
            name: 'Albus',
            lastName: 'Dumbledore'
          },
          {
            name: 'Lucius',
            lastName: 'Malfoy'
          }
        ],
        edges: []
      })

      expect(() => graph = Graph.fromObject({
        nodes: [
          {
            name: 'Albus',
            lastName: 'Dumbledore',
            id: 'the-wisest'
          },
          {
            name: 'Lucius',
            lastName: 'Malfoy',
            id: 'lucius'
          }
        ],
        edges: [
          {
            from: 'lucius',
            to: 'the-wisest',
            labels: ['dislikes']
          }
        ]
      })).not.toThrow();
      expect(() => result = graph.toObject()).not.toThrow()
      expect(result).toEqual({
        nodes: [
          {
            name: 'Lucius',
            lastName: 'Malfoy',
            id: 'lucius'
          },
          {
            name: 'Albus',
            lastName: 'Dumbledore',
            id: 'the-wisest'
          }
        ],
        edges: [
          {
            from: 'lucius',
            to: 'the-wisest',
            labels: ['dislikes']
          }
        ]
      })
    })
  })

  describe('nodes union', () => {
    it('should merge empty graph nodes into new graph', () => {
      let g1;
      let g2;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => g2 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => result = g1.nodes.union(g2)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [],
        edges: []
      })
      expect(() => result = g2.nodes.union(g1)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [],
        edges: []
      })

    })

    it('should merge graph nodes into new graph', () => {
      let g1;
      let g2;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [{
          name: 'Harry',
          lastName: 'Potter'
        }],
        edges: []
      })).not.toThrow();
      expect(() => g2 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => result = g1.nodes.union(g2)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [
          {
            name: 'Harry',
            lastName: 'Potter'
          }
        ],
        edges: []
      })
      expect(() => result = g2.nodes.union(g1)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [
          {
            name: 'Harry',
            lastName: 'Potter'
          }
        ],
        edges: []
      })
    })
  })

  describe('nodes removal', () => {
    it('should throw error if node does not exist', () => {
      let g1;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [
          {
            name: 'Albus',
            lastName: 'Dumbledore'
          },
          {
            name: 'Lord',
            lastName: 'Voldemort'
          }
        ],
        edges: [

        ]
      })).not.toThrow()
      expect(() => result = g1.nodes.remove({
        name: 'Inexistent',
        lastName: 'Node'
      })).toThrowError(
        `Could not remove Node from Graph: Node does not exist`
      );
    })

    it('should remove node from graph', () => {
      let g1;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [
          {
            name: 'Albus',
            lastName: 'Dumbledore'
          },
          {
            name: 'Lord',
            lastName: 'Voldemort'
          }
        ],
        edges: [

        ]
      })).not.toThrow()
      expect(() => result = g1.nodes.remove({
        name: 'Lord',
        lastName: 'Voldemort'
      })).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [
          {
            name: 'Albus',
            lastName: 'Dumbledore'
          }
        ],
        edges: []
      })


      expect(() => g1 = Graph.fromObject({
        nodes: [
          {
            name: 'Albus',
            lastName: 'Dumbledore'
          },
          {
            name: 'Lord',
            lastName: 'Voldemort'
          }
        ],
        edges: [
          {
            from: 0,
            to: 1
          }
        ]
      })).not.toThrow()
      expect(() => result = g1.nodes.remove({
        name: 'Lord',
        lastName: 'Voldemort'
      })).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [
          {
            name: 'Albus',
            lastName: 'Dumbledore'
          }
        ],
        edges: [
          {
            from: 0,
            to: 1
          }
        ]
      })
    })

  })

  describe('nodes reachedById', () => {
    it('should return nodes reached by another node', () => {
      let g1;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => result = g1.nodes.reachedById('inexistentId')).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [],
        edges: []
      })

      expect(() => g1 = Graph.fromObject({
        nodes: [
          {
            name: 'Harry',
            lastName: 'Potter',
            id: 'harry'
          },
          {
            name: 'Severus',
            lastName: 'Snape',
            id: 'snape'
          },
          {
            name: 'Lilian',
            lastName: 'Potter',
            id: 'lilian'
          },
          {
            name: 'Remus',
            lastName: 'Lupin',
            id: 'lupin'
          }
        ],
        edges: [
          {
            from: 'harry',
            to: 'snape',
            labels: ['DISLIKES']
          },
          {
            from: 'snape',
            to: 'lilian',
            labels: ['LIKES']
          },
          {
            from: 'lupin',
            to: 'snape',
            labels: ['DISLIKES']
          },
        ]
      })).not.toThrow();
      expect(() => result = g1.nodes.reachedById('lupin')).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [
          {
            name: 'Severus',
            lastName: 'Snape',
            id: 'snape'
          }
        ],
        edges: []
      })
      expect(() => g1 = g1.edges.add({
        from: 'lupin',
        to: 'harry',
        labels: ['LIKES']
      })).not.toThrow();
      expect(() => result = g1.nodes.reachedById('lupin')).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [
          {
            name: 'Severus',
            lastName: 'Snape',
            id: 'snape'
          },
          {
            name: 'Harry',
            lastName: 'Potter',
            id: 'harry'
          },
        ],
        edges: []
      })
    })
  })

  describe('nodes getId', () => {
    it ('should throw error if id does not exist', () => {
      let g1;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => result = g1.nodes.getId('inexistentId')).toThrowError(
        `Could not get Node: Node Id 'inexistentId' does not exist in Graph`
      )
    })

    it ('should return a node given its id', () => {
      let g1;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [
          {
            name: 'Lord',
            lastName: 'Voldemort',
            id: 'the-evil-one'
          },
          {
            name: 'Harry',
            lastName: 'Potter',
            id: 'expelliarmus!'
          }
        ],
        edges: []
      })).not.toThrow();
      expect(() => result = g1.nodes.getId('inexistentId')).toThrowError(
        `Could not get Node: Node Id 'inexistentId' does not exist in Graph`
      )
      expect(() => result = g1.nodes.getId('expelliarmus!')).not.toThrow()
      expect(result).toEqual({
        name: 'Harry',
        lastName: 'Potter',
        id: 'expelliarmus!'
      })

      expect(() => result = g1.nodes.getId('the-evil-one')).not.toThrow()
      expect(result).toEqual({
          name: 'Lord',
          lastName: 'Voldemort',
          id: 'the-evil-one'
      })
    })
  })

  describe('edges fromId', () => {
    it('should return graph with edges from given node id', () => {
      let g1;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [
          {
            name: 'Harry',
            lastName: 'Potter',
            id: 'harry'
          },
          {
            name: 'Ronald',
            lastName: 'Weasley',
            id: 'ronald'
          }
        ],
        edges: [
          {
            from: 'harry',
            to: 'ronald',
            labels: ['IS_FRIEND'],
            id: 'edge0'
          },
          {
            from: 'a',
            to: 'b',
            labels: ['IS_FRIEND'],
            id: 'edge1'
          }
        ]
      })).not.toThrow();
      expect(() => result = g1.edges.fromId('harry')).not.toThrow()
      expect(result.toObject()).toEqual({
        nodes: [],
        edges: [
          {
            from: 'harry',
            to: 'ronald',
            labels: ['IS_FRIEND'],
            id: 'edge0'
          }
        ]
      })
    })
  })

  describe('edges union', () => {
    it('should merge empty edges graph into new graph', () => {
      let g1;
      let g2;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => g2 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => result = g1.edges.union(g2)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [],
        edges: []
      })
      expect(() => result = g2.edges.union(g1)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [],
        edges: []
      })
    })

    it('should merge graph edges into new graph', () => {
      let g1;
      let g2;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [{
          name: 'Harry',
          lastName: 'Potter'
        }],
        edges: [
          {
            from: '0',
            to: '1'
          }
        ]
      })).not.toThrow();
      expect(() => g2 = Graph.fromObject({
        nodes: [{
          name: 'Lord',
          lastName: 'Voldemort'
        }],
        edges: [
          {
            from: '1',
            to: '2'
          }
        ]
      })).not.toThrow();
      expect(() => result = g1.edges.union(g2)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [
          {
            name: 'Harry',
            lastName: 'Potter'
          }
        ],
        edges: [{
          from: '1',
          to: '2'
        }, {
          from: '0',
          to: '1'
        }]
      })
    })
  })

  describe('edges toggle', () => {
    it('should toggle edges', () => {
      let result = Graph.fromObject({
        nodes: [
          {
            name: 'Harry',
            lastName: 'Potter',
            id: 'harry'
          },
          {
            name: 'James',
            lastName: 'Potter',
            id: 'james'
          }
        ],
        edges: []
      })

      expect(() => result = result.edges.toggle({
        from: 'james',
        to: 'harry',
        labels: ['FATHER OF'],
        id: 'e1'
      })).not.toThrow()

      expect(result.toObject()).toEqual({
        nodes: [
          {
            name: 'Harry',
            lastName: 'Potter',
            id: 'harry'
          },
          {
            name: 'James',
            lastName: 'Potter',
            id: 'james'
          }
        ],
        edges: [
          {
            from: 'james',
            to: 'harry',
            labels: ['FATHER OF'],
            id: 'e1'
          }
        ]
      })

      expect(() => result = result.edges.toggle({
        from: 'james',
        to: 'harry',
        labels: ['FATHER OF'],
        id: 'e1'
      })).not.toThrow()

      expect(result.toObject()).toEqual({
        nodes: [
          {
            name: 'Harry',
            lastName: 'Potter',
            id: 'harry'
          },
          {
            name: 'James',
            lastName: 'Potter',
            id: 'james'
          }
        ],
        edges: []
      })

      expect(() => result = result.edges.toggle({
        from: 'james',
        to: 'harry',
        labels: ['FATHER OF'],
        id: 'e1'
      })).not.toThrow()

      expect(result.toObject()).toEqual({
        nodes: [
          {
            name: 'Harry',
            lastName: 'Potter',
            id: 'harry'
          },
          {
            name: 'James',
            lastName: 'Potter',
            id: 'james'
          }
        ],
        edges: [
          {
            from: 'james',
            to: 'harry',
            labels: ['FATHER OF'],
            id: 'e1'
          }
        ]
      })

    })
  })

  describe('union', () => {
    it('should merge 2 graphs into a new one', () => {
      let g1;
      let g2;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => g2 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => result = g1.union(g2)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [],
        edges: []
      })

      expect(() => g1 = Graph.fromObject({
        nodes: [{
          name: 'Harry',
          lastName: 'Potter'
        }],
        edges: []
      })).not.toThrow();
      expect(() => g2 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => result = g1.union(g2)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [{
          name: 'Harry',
          lastName: 'Potter'
        }],
        edges: []
      })


      expect(() => g1 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => g2 = Graph.fromObject({
        nodes: [{
          name: 'Harry',
          lastName: 'Potter'
        }],
        edges: []
      })).not.toThrow();
      expect(() => result = g1.union(g2)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [{
          name: 'Harry',
          lastName: 'Potter'
        }],
        edges: []
      })


      expect(() => g1 = Graph.fromObject({
        nodes: [{
          name: 'Lord',
          lastName: 'Voldemort'
        }],
        edges: [{
          from: '2',
          to: '3'
        }]
      })).not.toThrow();
      expect(() => g2 = Graph.fromObject({
        nodes: [{
          name: 'Harry',
          lastName: 'Potter'
        }],
        edges: [{
          from: '1',
          to: '2'
        }]
      })).not.toThrow();
      expect(() => result = g1.union(g2)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [{
          name: 'Harry',
          lastName: 'Potter'
        }, {
          name: 'Lord',
          lastName: 'Voldemort'
        }],
        edges: [{
          from: '2',
          to: '3'
        }, {
          from: '1',
          to: '2'
        }]


      })
    })
  })
})
