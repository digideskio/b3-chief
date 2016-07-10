import { test } from 'ava';

import Chief from '../src/Chief';

test.beforeEach((t) => {
	t.context.instance = Chief.create();
	t.context.tree = t.context.instance.createTree();
	t.context.rootNode = t.context.tree.setRootNode(
		t.context.tree.createNode('Sequence')
	);
});

test('getChildren() returns empty array without any children present', (t) => {
	const { rootNode } = t.context;
	t.is(rootNode.getChildren().length, 0);
});

test('hasChildren() checks if node has any children', (t) => {
	const { tree, rootNode } = t.context;
	t.false(rootNode.hasChildren());
	const node = tree.addNode(tree.createNode('Priority'));
	rootNode.addChild(node);
	t.true(rootNode.hasChildren());
});

test('addChild() appends node to children list', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Runner'));
	rootNode.addChild(node);
	t.deepEqual(rootNode.getChildren(), [node]);
});

test('addChild() sets parent of added child node', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Succeeder'));
	rootNode.addChild(node);
	t.is(node.getParent(), rootNode);
});

test('addChild() rejects child that is present', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Succeeder'));
	rootNode.addChild(node);
	t.throws(() => rootNode.addChild(node), /is child of/);
});

test('addChild() rejects child that has other parent', (t) => {
	const { instance, tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Failer'));
	rootNode.addChild(node);
	const secondTree = instance.addTree(instance.createTree());
	const secondRootNode = secondTree.setRootNode(secondTree.createNode('Priority'));
	t.throws(() => secondRootNode.addChild(node), /has parent/);
});

test('addChild() triggers updatable handlers', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Runner'));
	t.plan(1);
	rootNode.onUpdate((update) => t.is(update.payload, node));
	rootNode.addChild(node);
});

test('hasChild() verifies if child is already present in parent', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Succeeder'));
	rootNode.addChild(node);
	t.true(rootNode.hasChild(node));
	t.false(node.hasChild(rootNode));
});

test('removeChild() removes node from children list and returns it', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Succeeder'));
	rootNode.addChild(node);
	const removed = rootNode.removeChild(node);
	t.is(rootNode.getChildren().length, 0);
	t.is(removed, node);
});

test('removeChild() clears parent node from removed child', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Succeeder'));
	rootNode.addChild(node);
	rootNode.removeChild(node);
	t.falsy(node.getParent());
});

test('removeChild() returns null if child is not present', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Succeeder'));
	t.is(rootNode.removeChild(node), null);
});

test('removeChild() returns null if no child node is passed in ', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Succeeder'));
	rootNode.addChild(node);
	rootNode.removeChild();
	t.is(rootNode.getChildren().length, 1);
});

test('removeChild() triggers updatable handlers', (t) => {
	const { tree, rootNode } = t.context;
	const node = tree.addNode(tree.createNode('Succeeder'));
	rootNode.addChild(node);
	t.plan(1);
	rootNode.onUpdate((update) => t.is(update.target, rootNode));
	rootNode.removeChild(node);
});


test('acceptsChildren() returns false for action nodes', (t) => {
	const { tree } = t.context;
	const actionNode = tree.addNode(tree.createNode('Runner'));
	t.false(actionNode.acceptsChildren());
});

test('acceptsChildren() returns true for composite nodes', (t) => {
	const { rootNode } = t.context;
	t.true(rootNode.acceptsChildren());
});

test('acceptsChildren() returns true for decorator node without child', (t) => {
	const { tree } = t.context;
	const node = tree.addNode(tree.createNode('Inverter'));
	t.true(node.acceptsChildren());
});

test('acceptsChildren() returns false for decorator node with child', (t) => {
	const { tree } = t.context;
	const inverterNode = tree.addNode(tree.createNode('Inverter'));
	const goodNode = tree.addNode(tree.createNode('Runner'));
	inverterNode.addChild(goodNode);
	t.false(inverterNode.acceptsChildren());
	inverterNode.removeChild(goodNode);
	t.true(inverterNode.acceptsChildren());
});

test('emits `status` with returned status whenever node is ticked', (t) => {
	const { instance, tree, rootNode } = t.context;
	const subject = instance.addSubject(tree);
	t.plan(2);

	rootNode.once('status', (status) => t.is(status, Chief.status.SUCCESS));
	tree.tick(instance.addSubject(tree));

	rootNode.addChild(tree.addNode(tree.createNode('Failer')));
	rootNode.once('status', (status) => {
		t.is(status, Chief.status.FAILURE);
	});
	tree.tick(subject);
});

test('getProperties() returns properties specified on behavior node prototype', (t) => {
	const { tree } = t.context;
	const node = tree.addNode(tree.createNode('Repeater'));
	t.truthy(node.getProperties());
});

test('toString() contains Id of the node', (t) => {
	const { rootNode } = t.context;
	t.true(rootNode.toString().indexOf(rootNode.getId()) >= 0);
});
