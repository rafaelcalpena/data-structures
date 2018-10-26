import {Graph} from './graph'
import { SSet } from '../sset/sset';

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
      expect(result.nodes).toContain(
        jasmine.objectContaining({
          name: 'Albus',
          lastName: 'Dumbledore'
        })
      )
      expect(result.nodes).toContain(
        jasmine.objectContaining({
          name: 'Lucius',
          lastName: 'Malfoy'
        })
      )
      expect(result.edges).toEqual([])

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
          jasmine.objectContaining({
            from: 'lucius',
            to: 'the-wisest',
            labels: ['dislikes']
          })
        ]
      })
    })

    it('should create empty graph', () => {
      let graph;
      expect(() => graph =  Graph.fromEmpty()).not.toThrow();
      expect(graph.toObject()).toEqual({
        edges: [],
        nodes: []
      })
    })
  })

  describe('graph changes', () => {
    describe('changesFrom', () => {
      it('should return the changes between two graphs', () => {
        let g1 = Graph.fromObject({
          edges: [],
          nodes: [{
            testing: 'true',
            id: '1'
          }]
        });
        let g2 = Graph.fromObject({
          edges: [],
          nodes: []
        });
        let changeLog;

        expect(() => changeLog = g1.changesFrom(g2)).not.toThrow();
        expect(changeLog.nodes.toArray()).toContain({
          type: 'add',
          id: '1',
          item: {
            id: '1',
            testing: 'true'
          }
        });

        expect(() => changeLog = g1.changesTo(g2)).not.toThrow();
        expect(changeLog.nodes.toArray()).toContain({
          type: 'remove',
          id: '1',
          item: {
            id: '1',
            testing: 'true'
          }
        });
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
          jasmine.objectContaining({
            name: 'Harry',
            lastName: 'Potter'
          })
        ],
        edges: []
      })
      expect(() => result = g2.nodes.union(g1)).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [
          jasmine.objectContaining({
            name: 'Harry',
            lastName: 'Potter'
          })
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
            lastName: 'Dumbledore',
            id: 'albus'
          },
          {
            name: 'Lord',
            lastName: 'Voldemort',
            id: 'voldemort'
          }
        ],
        edges: [

        ]
      })).not.toThrow()
      expect(() => result = g1.nodes.remove({
        name: 'Lord',
        lastName: 'Voldemort',
        id: 'voldemort'
      })).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [
          jasmine.objectContaining({
            name: 'Albus',
            lastName: 'Dumbledore'
          })
        ],
        edges: []
      })


      expect(() => g1 = Graph.fromObject({
        nodes: [
          {
            name: 'Albus',
            lastName: 'Dumbledore',
            id: 'albus'
          },
          {
            name: 'Lord',
            lastName: 'Voldemort',
            id: 'voldemort'
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
        lastName: 'Voldemort',
        id: 'voldemort'
      })).not.toThrow();
      expect(result.toObject()).toEqual({
        nodes: [
          jasmine.objectContaining({
            name: 'Albus',
            lastName: 'Dumbledore'
          })
        ],
        edges: [
          jasmine.objectContaining({
            from: 0,
            to: 1
          })
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

  describe('nodes getByHash', () => {
    it ('should return node by hash', () => {
      let g = Graph.fromObject({
        edges: [],
        nodes: [{
          abc: 'def',
          id: 1234
        }]
      })
      expect(g.nodes.getByHash(SSet.hashOf({
        abc: 'def',
        id: 1234
      }))).toEqual({
        abc: 'def',
        id: 1234
      });
    })
  })

  describe('nodes getByIdHash', () => {
    it ('should return node by id hashed', () => {
      let g = Graph.fromObject({
        edges: [],
        nodes: [{
          abc: 'def',
          id: 1234
        }]
      })
      expect(g.nodes.getByIdHash(SSet.hashOf(1234))).toEqual({
        abc: 'def',
        id: 1234
      });
    })
  })

  describe('edges getByHash', () => {
    it ('should return edge by hash', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 'abc',
          to: 'def',
          id: 1234
        }],
        nodes: []
      })
      expect(g.edges.getByHash(SSet.hashOf({
        from: 'abc',
        to: 'def',
        id: 1234
      }))).toEqual({
        from: 'abc',
        to: 'def',
        id: 1234
      });
    })
  })

  describe('edges getByIdHash', () => {
    it ('should return edge by id hashed', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 'abc',
          to: 'def',
          id: 1234
        }],
        nodes: []
      })
      expect(g.edges.getByIdHash(SSet.hashOf(1234))).toEqual({
        from: 'abc',
        to: 'def',
        id: 1234
      });
    })
  })

  describe('nodes addition', () => {
    it('should throw error if node already exists', () => {
      let graph = Graph.fromObject({
        edges: [],
        nodes: [
          {
            name: 'Colin',
            lastName: 'Creevey',
            id: 'the-photographer'
          }
        ]
      });

      expect(() => graph.nodes.add({
        name: 'Colin',
        lastName: 'Creevey',
        id: 'the-photographer'
      })).toThrowError(
        `Could not add Node to Graph: Node already exists`
      )
    })

    it('should add node to empty graph and preserve edges', () => {
      let graph = Graph.fromEmpty();
      expect(() => graph = graph.nodes.add({
        name: 'Mundungus',
        lastName: 'Fletcher',
        id: 'mundungus'
      })).not.toThrow()

      expect(graph.toObject()).toEqual({
        edges: [],
        nodes: [{
          name: 'Mundungus',
          lastName: 'Fletcher',
          id: 'mundungus'
        }]
      })

      expect(() => graph = Graph.fromObject({
        edges: [{
          from: 'mundungus',
          to: 'harry',
          id: 'm-h',
          labels: ['TELL_ON']
        }],
        nodes: [{
          id: 'mundungus'
        }]
      })).not.toThrow()

      expect(() => graph = graph.nodes.add({
        id: 'harry'
      })).not.toThrow();

      expect(graph.toObject()).toEqual({
        edges: [{
          from: 'mundungus',
          to: 'harry',
          id: 'm-h',
          labels: ['TELL_ON']
        }],
        nodes: [{
          id: 'mundungus'
        }, {
          id: 'harry'
        }]
      })
    })
  })

  describe('nodes hasId', () => {
    it('should return true when it exists', () => {
      let g = Graph.fromObject({
        edges: [],
        nodes: [{
          id: 'node0'
        }]
      });
      expect(g.nodes.hasId('node0')).toEqual(true);
      expect(g.nodes.hasId('another-node')).toEqual(false);
    })
  })

  describe('nodes update', () => {
    it('should throw error when node does not exist', () => {
      let g = Graph.fromEmpty();
      expect(() => g = g.nodes.update({
        id: 'inexistentId'
      }, {
        id: 'newId'
      })).toThrowError(
        `Could not update Node from Graph: Node does not exist`
      );

      g = Graph.fromObject({
        edges: [],
        nodes: [{
          id: '1234'
        }]
      })
      expect(() => g = g.nodes.update({
        id: 'inexistentId'
      }, {
        id: 'newId'
      })).toThrowError(
        `Could not update Node from Graph: Node does not exist`
      );
    })

    it('should update graph when node exists', () => {
      let g = Graph.fromObject({
        edges: [],
        nodes: [{
          id: '1234'
        }, {
          id: 'another-node'
        }]
      })
      expect(() => g = g.nodes.update({
        id: '1234'
      }, {
        id: 'newId'
      })).not.toThrow();
      expect(g.toObject().nodes).toContain({
        id: 'newId'
      })
      expect(g.toObject().nodes).toContain({
        id: 'another-node'
      })
    })
  })

  describe('nodes oneReachedById', () => {
    it('should return one node reached by given node id', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 'a',
          to: 'b',
          id: 'a-b'
        }],
        nodes: [{
          id: 'a'
        }, {
          id: 'b'
        }]
      });
      expect(g.nodes.oneReachedById('a')).toEqual({
        id: 'b'
      })
    })

    it('should return undefined when there are no nodes reached by id', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 'a',
          to: 'b',
          id: 'a-b'
        }],
        nodes: [{
          id: 'a'
        }, {
          id: 'b'
        }]
      });
      expect(g.nodes.oneReachedById('inexistent')).toBeUndefined()
    })
  })

  describe('nodes find', () => {

    let g;
    beforeEach(() => {
      g = Graph.fromObject({
        edges: [],
        nodes: [{
          id: 'n1'
        }, {
          id: 'n2',
          name: 'Node 2'
        }, {
          id: 1
        }]
      });

    })

    it('should find node by id', () => {
      expect(g.nodes.find({
        id: 'n1'
      }).toObject().nodes).toEqual([{
        id: 'n1'
      }]);
      expect(g.nodes.find({
        id: '1'
      }).toObject().nodes).toEqual([])
      expect(g.nodes.find({
        id: 1
      }).toObject().nodes).toEqual([{
        id: 1
      }])
    })

    it('should not fail for inexistent key', () => {
      let result;
      expect(() => result = g.nodes.find({
        anyKey: 'anyValue'
      })).not.toThrow();

      expect(result.toObject().nodes).toEqual([]);
    })

    it('should not fail for keys that exist in only one object', () => {
      let result;
      expect(() => result = g.nodes.find({
        name: 'Node 2'
      })).not.toThrow();

      expect(result.toObject().nodes).toEqual([{
        id: 'n2',
        name: 'Node 2'
      }]);
    })
  })

  describe('nodes filter', () => {
    it('should filter the nodes', () => {
      let g = Graph.fromObject({
        edges: [],
        nodes: [{
          name: 'California',
          country: 'USA'
        }, {
          name: 'DC',
          country: 'USA'
        }, {
          name: 'Sao Paulo',
          country: 'Brazil'
        }, {
          name: 'Missouri',
          country: 'USA'
        }, {
          name: 'Maranhao',
          country: 'Brazil'
        }]
      })
      let fromUS = g.nodes.filter(n => n.country === 'USA')
      expect(fromUS.toObject().nodes).toContain(jasmine.objectContaining({
        name: 'California',
        country: 'USA'
      }))
      expect(fromUS.toObject().nodes).toContain(jasmine.objectContaining({
        name: 'DC',
        country: 'USA'
      }))
      expect(fromUS.toObject().nodes).toContain(jasmine.objectContaining({
        name: 'Missouri',
        country: 'USA'
      }))
      expect(fromUS.toObject().nodes).not.toContain(jasmine.objectContaining({
        name: 'Sao Paulo',
        country: 'Brazil'
      }))
      expect(fromUS.toObject().nodes).not.toContain(jasmine.objectContaining({
        name: 'Maranhao',
        country: 'Brazil'
      }))
      let startsWithM = g.nodes.filter(n => n.name[0] === 'M');
      expect(startsWithM.toObject().nodes).not.toContain(jasmine.objectContaining({
        name: 'California',
        country: 'USA'
      }))
      expect(startsWithM.toObject().nodes).not.toContain(jasmine.objectContaining({
        name: 'DC',
        country: 'USA'
      }))
      expect(startsWithM.toObject().nodes).toContain(jasmine.objectContaining({
        name: 'Missouri',
        country: 'USA'
      }))
      expect(startsWithM.toObject().nodes).not.toContain(jasmine.objectContaining({
        name: 'Sao Paulo',
        country: 'Brazil'
      }))
      expect(startsWithM.toObject().nodes).toContain(jasmine.objectContaining({
        name: 'Maranhao',
        country: 'Brazil'
      }))
    })
  })

  describe('nodes forEach', () => {
    it('should iterate on nodes', () => {
      let arr = [
        {id: 'abc'},
        {id: 'def'},
        {id: 'ghi'},
        {id: 'jkl'}
      ];
      let c = Graph.fromObject({
        nodes: arr,
        edges: []
      });
      c.nodes.forEach(item => {
        let index = arr.findIndex(i => i.id === item.id);
        arr.splice(arr.indexOf(item), 1);
      })
      expect(arr.length).toBe(0);
    })
  })

  describe('nodes has', () => {
    it('should return true when node exists', () => {
      let g = Graph.fromObject({
        edges: [],
        nodes: [{
          name: 'California',
          country: 'USA',
          id: 0
        }, {
          name: 'DC',
          country: 'USA',
          id: 1
        }, {
          name: 'Sao Paulo',
          country: 'Brazil',
          id: 2
        }, {
          name: 'Missouri',
          country: 'USA',
          id: 3
        }, {
          name: 'Maranhao',
          country: 'Brazil',
          id: 4
        }]
      })

      expect(g.nodes.has({
        name: 'California',
        country: 'USA',
        id: 0
      })).toBe(true);
      expect(g.nodes.has({
        name: 'Florida',
        country: 'USA',
        id: 0
      })).toBe(false);
    })
  })

  describe('nodes isEmpty', () => {
    it('should return true when empty', () => {
      let g = Graph.fromObject({
        edges: [],
        nodes: [{
          name: 'California',
          country: 'USA'
        }, {
          name: 'DC',
          country: 'USA'
        }]
      })
      expect(g.nodes.isEmpty()).toBe(false);
      g = Graph.fromEmpty();
      expect(g.nodes.isEmpty()).toBe(true);
    })
  })

  describe('nodes getStartingNodes', () => {
    it('should return nodes without incoming connections', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 1,
          to: 2
        }],
        nodes: [{
          id: 1
        }, {
          id: 2
        }]
      });
      expect(g.nodes.getStartingNodes().toObject()).toEqual({
        edges: [],
        nodes: [{
          id: 1
        }]
      })
      g = Graph.fromObject({
        edges: [{
          from: 1,
          to: 2
        }, {
          from: 2,
          to: 1
        }],
        nodes: [{
          id: 1
        }, {
          id: 2
        }]
      })
      expect(g.nodes.getStartingNodes().toObject()).toEqual({
        edges: [],
        nodes: []
      })

      g = Graph.fromObject({
        edges: [{
          from: 1,
          to: 2
        }, {
          from: 1,
          to: 3
        }],
        nodes: [{
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }]
      })
      expect(g.nodes.getStartingNodes().toObject()).toEqual({
        edges: [],
        nodes: [{
          id: 1
        }]
      })

      g = Graph.fromObject({
        edges: [{
          from: 1,
          to: 3
        }, {
          from: 2,
          to: 3
        }],
        nodes: [{
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }]
      })
      let n = g.nodes.getStartingNodes().toObject().nodes;
      expect(n).toContain({
        id: 1
      })
      expect(n).toContain({
        id: 2
      })
    })
  })

  describe('nodes topologicalSort', () => {
    it('should return topological levels', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 1,
          to: 2
        }],
        nodes: [{
          id: 1
        }, {
          id: 2
        }]
      })

      let toArray = (arr) => arr.map(l => l.toObject().nodes);

      expect(toArray(g.nodes.topologicalSort())).toEqual([
        [{id: 1}],
        [{id: 2}]
      ])

      g = Graph.fromObject({
        edges: [{
          from: 1,
          to: 2
        }, {
          from: 2,
          to: 3
        }],
        nodes: [{
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }]
      })
      expect(toArray(g.nodes.topologicalSort())).toEqual([
        [{id: 1}],
        [{id: 2}],
        [{id: 3}]
      ])

      g = Graph.fromObject({
        edges: [{
          from: 1,
          to: 2
        }, {
          from: 1,
          to: 3
        }, {
          from: 2,
          to: 4
        }, {
          from: 3,
          to: 4
        }],
        nodes: [{
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }, {
          id: 4
        }]
      })
      expect(toArray(g.nodes.topologicalSort())).toEqual([
        [{id: 1}],
        [{id: 3}, {id: 2}],
        [{id: 4}]
      ])
    })

  })

  describe('nodes difference', () => {
    it('should return self if difference equals itself', () => {
      let g = Graph.fromObject({
        edges: [],
        nodes: [{id: 5}, {id: 7}, {id: 8}, {id: 9}, {id: 12}]
      }),
      g2 = Graph.fromObject({
        edges: [],
        nodes: [{id: 89}, {id: 90}, {id: 8172}, {id: 123}]
      }),
      g3;
      expect(() => g3 = g.nodes.difference(g2)).not.toThrow();
      expect(g3).toBe(g);

      g2 = Graph.fromObject({
        edges: [],
        nodes: [{id:5}]
      });
      expect(() => g3 = g.nodes.difference(g2)).not.toThrow();
      expect(g3).not.toBe(g);
    })
  })

  describe('nodes iterator', () => {
    it('should provide items to for ... of loop', () => {
      let g = Graph.fromObject({
        edges: [],
        nodes: [{id: 5}, {id: 7}, {id: 11}, {id: 13}, {id: 1}]
      })
      let s = 0;
      for (let i of (g.nodes as any)){
        s += i.id;
      }
      expect(s).toBe(37);
    })
  })

  describe('edges iterator', () => {
    it('should provide items to for ... of loop', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 0,
          to: 0,
          id: 5
        }, {
          id: 7,
          from: 0,
          to: 0
        }, {
          id: 11,
          from: 0,
          to: 0,
        }, {
          id: 13,
          from: 0,
          to: 0,
        }, {
          id: 1,
          from: 0,
          to: 0,
        }],
        nodes: []
      })
      let s = 0;
      for (let i of (g.edges as any)){
        s += i.id;
      }
      expect(s).toBe(37);
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

  describe('edges add', () => {
    it('should not allow existing edge to be re-added', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 0,
          to: 1,
          id: 987
        }],
        nodes: []
      })

      expect(() => g.edges.add({
        from: 0,
        to: 1,
        id: 987
      })).toThrowError(
        `Could not add Edge to Graph: Edge Id already exists`
      )
    })
  })

  describe('edges size', () => {
    it('should return size of collection', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 0,
          to: 1,
          id: 987
        }],
        nodes: []
      })
      expect(g.edges.size()).toEqual(1)
      g = Graph.fromObject({
        edges: [{
          from: 0,
          to: 1,
          id: 987
        }, {
          from: 1,
          to: 2,
          id: 765
        }],
        nodes: []
      })
      expect(g.edges.size()).toEqual(2);
      g = Graph.fromEmpty();
      expect(g.edges.size()).toEqual(0);
    })
  })

  describe('edges update', () => {
    it('should throw error if edge does not exist', () => {
      let g = Graph.fromEmpty();
      expect(() => g.edges.update({
        from: 0,
        to: 1
      })).toThrowError(
        `Could not update Edge from Graph: Edge does not exist`
      )
    })

    it('should update edge', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 0,
          to: 1,
          labels: [],
          id: 'edge'
        }],
        nodes: [{
          name: 'abc'
        }]
      });
      expect(() => g = g.edges.update({
        from: 0,
        to: 1,
        labels: [],
        id: 'edge'
      }, {
        from: 1,
        to: 2,
        labels: ['TEST']
      })).not.toThrow();

      expect(g.toObject()).toEqual(<any> {
        edges: [jasmine.objectContaining({
          from: 1,
          to: 2,
          labels: ['TEST']
        })],
        nodes: [jasmine.objectContaining({
          name: 'abc'
        })]
      })
    })
  })

  describe('edges updateId', () => {
    it('should throw error if edge does not exist', () => {
      let g = Graph.fromEmpty();
      expect(() => g.edges.updateId({
        id: 'inexistent'
      })).toThrowError(
        `Could not update Edge from Graph: Edge does not exist`
      )
    })

    it('should update edge', () => {
      let edge = {
        from: 0,
        id: 'edge',
        to: 1,
        labels: []
      }
      let g = Graph.fromObject({
        edges: [edge],
        nodes: [{
          name: 'abc'
        }]
      });
      let g2;
      expect(() => g2 = g.edges.updateId('edge', {
        from: 1,
        to: 2,
        labels: ['TEST']
      })).not.toThrow();

      expect(g2.toObject()).toEqual({
        edges: [jasmine.objectContaining({
          from: 1,
          to: 2,
          labels: ['TEST']
        })],
        nodes: [jasmine.objectContaining({
          name: 'abc'
        })]
      })
      expect(g2).not.toBe(g);
    })

    it('should return self if there were no changes', () => {
      let obj = {
        from: 0,
        id: 'edge',
        to: 1,
        labels: []
      }
      let g = Graph.fromObject({
        edges: [obj],
        nodes: [{
          name: 'abc'
        }]
      });
      let g2;
      expect(() => g2 = g.edges.updateId('edge', {
        from: 0,
        id: 'edge',
        to: 1,
        labels: []
      })).not.toThrow();

      expect(g2).toBe(g);
    })
  })


  describe('nodes updateId', () => {
    it('should throw error if node does not exist', () => {
      let g = Graph.fromEmpty();
      expect(() => g.nodes.updateId({
        id: 'inexistent'
      })).toThrowError(
        `Could not update Node from Graph: Node does not exist`
      )
    })

    it('should update node', () => {
      let node = {
        f: 0,
        id: 'node',
        t: 1,
        labels: []
      }
      let g = Graph.fromObject({
        edges: [],
        nodes: [node]
      });
      let g2;
      expect(() => g2 = g.nodes.updateId('node', {
        f: 1,
        t: 2,
        labels: ['TEST']
      })).not.toThrow();

      expect(g2.toObject()).toEqual({
        nodes: [jasmine.objectContaining({
          f: 1,
          t: 2,
          labels: ['TEST']
        })],
        edges: []
      })
      expect(g2).not.toBe(g);
    })

    it('should return self if there were no changes', () => {
      let obj = {
        f: 0,
        id: 'node',
        t: 1,
        labels: []
      }
      let g = Graph.fromObject({
        nodes: [obj],
        edges: []
      });
      let g2;
      expect(() => g2 = g.nodes.updateId('node', {
        f: 0,
        id: 'node',
        t: 1,
        labels: []
      })).not.toThrow();

      expect(g2).toBe(g);
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
          lastName: 'Potter',
          id: 'harry'
        }],
        edges: [
          {
            from: '0',
            to: '1',
            id: 'edge'
          }
        ]
      })).not.toThrow();
      expect(() => g2 = Graph.fromObject({
        nodes: [{
          name: 'Lord',
          lastName: 'Voldemort',
          id: 'voldemort'
        }],
        edges: [
          {
            from: '1',
            to: '2',
            id: 'edge2'
          }
        ]
      })).not.toThrow();
      expect(() => result = g1.edges.union(g2)).not.toThrow();
      expect(result.toObject().nodes).toEqual([
          jasmine.objectContaining({
            name: 'Harry',
            lastName: 'Potter'
          })
        ])
      expect(result.toObject().edges).toContain(jasmine.objectContaining({
        from: '1',
        to: '2'
      }))
      expect(result.toObject().edges).toContain(jasmine.objectContaining({
        from: '0',
        to: '1'
      }))
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

  describe('edges map', () => {
    it('should map edges into new values', () => {
      let g = Graph.fromObject({
      edges: [{
        from: 0,
        to: 1,
        id: '0-1'
      }, {
        from: 1,
        to: 2,
        id: '0-2'
      }],
      nodes: []
    })

      let newGraph = g.edges.map(i => ({
        ...i,
        to: 3
      }))

      expect(newGraph.toObject().edges).toContain({
        from: 0,
        to: 3,
        id: '0-1'
      })

      expect(newGraph.toObject().edges).toContain({
        from: 1,
        to: 3,
        id: '0-2'
      })

      expect(newGraph.toObject().edges).not.toContain({
        from: 0,
        to: 1,
        id: '0-1'
      })

      expect(newGraph.toObject().edges).not.toContain({
        from: 0,
        to: 2,
        id: '0-2'
      })
    })

  })

  describe('edges filter', () => {
    it('should filter the edges', () => {
      let g = Graph.fromObject({
        edges: [{
          from: 0,
          to: 0,
          name: 'California',
          country: 'USA'
        }, {
          from: 0,
          to: 0,
          name: 'DC',
          country: 'USA'
        }, {
          from: 0,
          to: 0,
          name: 'Sao Paulo',
          country: 'Brazil'
        }, {
          from: 0,
          to: 0,
          name: 'Missouri',
          country: 'USA'
        }, {
          from: 0,
          to: 0,
          name: 'Maranhao',
          country: 'Brazil'
        }],
        nodes: []
      })

      let fromUS = g.edges.filter(n => n.country === 'USA')
      expect(fromUS.toObject().edges).toContain(jasmine.objectContaining({
        from: 0,
        to: 0,
        name: 'California',
        country: 'USA'
      }))
      expect(fromUS.toObject().edges).toContain(jasmine.objectContaining({
        from: 0,
        to: 0,
        name: 'DC',
        country: 'USA'
      }))
      expect(fromUS.toObject().edges).toContain(jasmine.objectContaining({
        from: 0,
        to: 0,
        name: 'Missouri',
        country: 'USA'
      }))
      expect(fromUS.toObject().edges).not.toContain(jasmine.objectContaining({
        from: 0,
        to: 0,
        name: 'Sao Paulo',
        country: 'Brazil'
      }))
      expect(fromUS.toObject().edges).not.toContain(jasmine.objectContaining({
        from: 0,
        to: 0,
        name: 'Maranhao',
        country: 'Brazil'
      }))
      let startsWithM = g.edges.filter(n => n.name[0] === 'M');
      expect(startsWithM.toObject().edges).not.toContain(jasmine.objectContaining({
        from: 0,
        to: 0,
        name: 'California',
        country: 'USA'
      }))
      expect(startsWithM.toObject().edges).not.toContain(jasmine.objectContaining({
        from: 0,
        to: 0,
        name: 'DC',
        country: 'USA'
      }))
      expect(startsWithM.toObject().edges).toContain(jasmine.objectContaining({
        from: 0,
        to: 0,
        name: 'Missouri',
        country: 'USA'
      }))
      expect(startsWithM.toObject().edges).not.toContain(jasmine.objectContaining({
        from: 0,
        to: 0,
        name: 'Sao Paulo',
        country: 'Brazil'
      }))
      expect(startsWithM.toObject().edges).toContain(jasmine.objectContaining({
        from: 0,
        to: 0,
        name: 'Maranhao',
        country: 'Brazil'
      }))
    })
  })

  describe('edges removal', () => {
    it('should throw error if edge does not exist', () => {
      let g1;
      let result;
      expect(() => g1 = Graph.fromObject({
        edges: [
          {
            from: 0,
            to: 0,
            name: 'Albus',
            lastName: 'Dumbledore'
          },
          {
            from: 0,
            to: 0,
            name: 'Lord',
            lastName: 'Voldemort'
          }
        ],
        nodes: [

        ]
      })).not.toThrow()
      expect(() => result = g1.edges.remove({
        name: 'Inexistent',
        lastName: 'Node'
      })).toThrowError(
        `Could not remove Edge from Graph: Edge does not exist`
      );
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
        nodes: [jasmine.objectContaining({
          name: 'Harry',
          lastName: 'Potter'
        })],
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
        nodes: [jasmine.objectContaining({
          name: 'Harry',
          lastName: 'Potter'
        })],
        edges: []
      })


      expect(() => g1 = Graph.fromObject(<any> {
        nodes: [{
          name: 'Lord',
          lastName: 'Voldemort',
          id: 'voldemort'
        }],
        edges: [{
          from: '2',
          to: '3',
          id: 'edge'
        }]
      })).not.toThrow();
      expect(() => g2 = Graph.fromObject({
        nodes: [{
          name: 'Harry',
          lastName: 'Potter',
          id: 'harry'
        }],
        edges: [{
          from: '1',
          to: '2',
          id: 'edge'
        }]
      })).not.toThrow();
      expect(() => result = g1.union(g2)).not.toThrow();
      expect(result.toObject().nodes).toContain(
        jasmine.objectContaining({
          name: 'Harry',
          lastName: 'Potter'
        }))
      expect(result.toObject().nodes).toContain(
        jasmine.objectContaining({
          name: 'Lord',
          lastName: 'Voldemort'
        }))
      expect(result.toObject().edges).toContain(
        jasmine.objectContaining({
        from: '2',
        to: '3'
      }))
      expect(result.toObject().edges).toContain(
      jasmine.objectContaining({
        from: '1',
        to: '2'
      }))
    })
  })

  describe('edges getId', () => {
    it ('should throw error if id does not exist', () => {
      let g1;
      let result;
      expect(() => g1 = Graph.fromObject({
        nodes: [],
        edges: []
      })).not.toThrow();
      expect(() => result = g1.edges.getId('inexistentId')).toThrowError(
        `Could not get Edge: Edge Id 'inexistentId' does not exist in Graph`
      )
    })

    it ('should return an edge given its id', () => {
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
        edges: [{
          from: 'expelliarmus',
          to: 'the-evil-one',
          labels: ['SURVIVED'],
          id: 'edge'
        }]
      })).not.toThrow();
      expect(() => result = g1.edges.getId('inexistentId')).toThrowError(
        `Could not get Edge: Edge Id 'inexistentId' does not exist in Graph`
      )
      expect(() => result = g1.edges.getId('edge')).not.toThrow()
      expect(result).toEqual({
        from: 'expelliarmus',
        to: 'the-evil-one',
        labels: ['SURVIVED'],
        id: 'edge'
      })
    })
  })
})
