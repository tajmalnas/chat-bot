export const findLeftmostChild = (tree: any, targetId: any) => {
    // Helper function to recursively search for the target node
    const findNode:any = (node: any) => {
      if (node.id == targetId) {
        return node;
      }
      for (const child of node.children) {
        const found = findNode(child);
        if (found) {
          return found;
        }
      }
      return null;
    };
  
    // Helper function to recursively find the deepest leftmost child
    const findDeepestLeftmostChild = (node: any) => {
      if (node.children.length === 0) {
        return node; // Base case: no more children, return the current node
      }
      return findDeepestLeftmostChild(node.children[0]); // Traverse the leftmost child
    };
  
    // Find the target node in the tree
    const targetNode = findNode(tree);
  
    // If the target node is found, find its deepest leftmost child
    if (targetNode && targetNode.children.length > 0) {
      return findDeepestLeftmostChild(targetNode);
    }
  
    // If no leftmost child is found, return null
    return {id:targetId};
  };

  export const findPathToLeftmostChild = (tree: any, targetId: any) => {
    // Helper function to recursively search for the target node and track the path
    const findNodeWithPath = (node: any, currentPath: any[]): { node: any; path: any[] } | null => {
      if (node.id === targetId) {
        return { node, path: [...currentPath, node.id] }; // Return the target node and its path
      }
      for (const child of node.children) {
        const result = findNodeWithPath(child, [...currentPath, node.id]);
        if (result) {
          return result; // Return if the target node is found in the subtree
        }
      }
      return null; // Target node not found in this subtree
    };
  
    // Helper function to recursively find the deepest leftmost child and track the path
    const findDeepestLeftmostChildWithPath = (node: any, currentPath: any[]): { node: any; path: any[] } => {
      if (node.children.length === 0) {
        return { node, path: [...currentPath, node.id] }; // Base case: no more children, return the current node and its path
      }
      return findDeepestLeftmostChildWithPath(node.children[0], [...currentPath, node.id]); // Traverse the leftmost child
    };
  
    // Find the target node and its path in the tree
    const targetResult = findNodeWithPath(tree, []);
  
    if (targetResult) {
      const { node: targetNode, path: targetPath } = targetResult;
  
      // If the target node has children, find the deepest leftmost child and its path
      if (targetNode.children.length > 0) {
        const leftmostResult = findDeepestLeftmostChildWithPath(targetNode, []);
        return {
          node: leftmostResult.node, // The leftmost child node
          path: [...targetPath, ...leftmostResult.path.slice(targetPath.length)], // Full path from root to leftmost child
        };
      } else {
        // If the target node has no children, return the target node and its path
        return { node: targetNode, path: targetPath };
      }
    }
  
    // If the target node is not found, return null
    return null;
  };

  export const transformToIdTree = (messageTree:any) => {
    return messageTree.map((message:any) => ({
      id: message.message_id,
      children: transformToIdTree(message.children),
    }));
  };

  