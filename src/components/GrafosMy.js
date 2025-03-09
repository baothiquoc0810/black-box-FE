import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Form, FormControl, Button } from 'react-bootstrap';

const GrafosMy = () => {
  
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const nodesRef = useRef(new DataSet([
    { id: 1, label: "Node 1" },
    { id: 2, label: "Node 2" },
    { id: 3, label: "Node 3" },
    { id: 4, label: "Node 4" },
  ]));
  const edgesRef = useRef(new DataSet([
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
  ]));

  useEffect(() => {
    const data = {
      nodes: nodesRef.current,
      edges: edgesRef.current,
    };

    const options = {
      manipulation: {
        enabled: true, // Bật chế độ thao tác
        initiallyActive: true, // Bật khi khởi động
      },
      nodes: {
        physics: true,
      },
    };

    networkRef.current = new Network(containerRef.current, data, options);
  }, []);

  const addNode = () => {
    const newNodeId = nodesRef.current.length + 1;
    nodesRef.current.add({ id: newNodeId, label: `Node ${newNodeId}` });
  };

  const addEdge = () => {
    if (networkRef.current) {
      networkRef.current.addEdgeMode();
    }
  };

  return (
    <div id="app">
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#">Navbar</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarSupportedContent" />
        <Navbar.Collapse id="navbarSupportedContent">
          <Nav className="mr-auto">
            <Nav.Link href="#">Home</Nav.Link>
            <Nav.Link href="#">Link</Nav.Link>
            <Nav.Link disabled href="#">Disabled</Nav.Link>
          </Nav>
          <Form inline>
            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-success">Search</Button>
          </Form>
        </Navbar.Collapse>
      </Navbar>
      <div ref={containerRef} id="mynetwork" style={{ width: '100%', height: '620px', margin: '5px 0', border: '1px solid #000' }} />
      <Button onClick={addNode} className="m-2">Add Node</Button>
      <Button onClick={addEdge} className="m-2">Add Edge</Button>
    </div>
  );
};

export default GrafosMy;
