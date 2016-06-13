import test from 'ava';

import Chief from '../src/Chief';
import TreeList from '../src/TreeList';

test.beforeEach((t) => {
	t.context.instance = Chief.create();
});

test('createTree() creates a new tree with unique ID', (t) => {
	const { instance } = t.context;

	const firstTree = instance.createTree('Sequence');
	t.truthy(firstTree.getId());

	const secondTree = instance.createTree('Sequence');
	t.not(firstTree.getId(), secondTree.getId());
});

test('createTree() sets rootNode property with created node model', (t) => {
	const { instance } = t.context;
	const tree = instance.createTree('Sequence');
	const rootNode = tree.getRootNode();
	t.truthy(rootNode);
	t.is(rootNode.getName(), 'Sequence');
});

test('createTree() passes node properties from second argument to root node', (t) => {
	const { instance } = t.context;
	const tree = instance.createTree('Repeater', { maxLoop: 5 });
	const rootNode = tree.getRootNode();
	t.is(rootNode.getBehaviorNode().maxLoop, 5);
});

test('createTree() emits `tree.create` event with added subject model', (t) => {
	const { instance } = t.context;
	let actual = null;
	instance.once('tree.create', (tree) => {
		actual = tree;
	});
	const tree = instance.createTree('Sequence');
	t.is(actual, tree);
});

test('createTree() can be called without root node specified', (t) => {
	const { instance } = t.context;
	t.notThrows(() => instance.createTree());
	t.falsy(instance.createTree().getRootNode());
});

test('getTree() returns tree by ID', (t) => {
	const { instance } = t.context;
	const expectedTree = instance.createTree('Sequence');
	t.is(instance.getTree(expectedTree.getId()), expectedTree);
	t.is(instance.getTree('non-existing'), null, 'should return null for non-existing tree');
});

test('listTrees() returns existing and created trees', (t) => {
	const { instance } = t.context;
	t.is(instance.listTrees().length, 0);

	const firstTree = instance.createTree('Sequence');
	t.is(Array.from(instance.listTrees()).length, 1, 'one subject');

	const secondTree = instance.createTree('Sequence');

	const trees = Array.from(instance.listTrees());
	t.is(trees.length, 2, 'two trees');
	t.is(trees[0], firstTree);
	t.is(trees[1], secondTree);
});

test('removeTree() removes tree by ID and returns it', (t) => {
	const { instance } = t.context;
	const firstTree = instance.createTree('Sequence');
	const secondTree = instance.createTree('Sequence');
	const removedTree = instance.removeTree(firstTree.getId());
	t.is(removedTree, firstTree);

	const trees = Array.from(instance.listTrees());
	t.is(trees.length, 1, 'one tree remaining');
	t.is(trees[0], secondTree, 'second tree still there');
});

test('removeTree() returns null for non-existing tree', (t) => {
	const { instance } = t.context;
	const removedTree = instance.removeTree('unknown');
	t.is(removedTree, null);
});

test('removeTree() emits `tree.remove` event with removed tree model', (t) => {
	const { instance } = t.context;
	let actual = null;
	instance.once('tree.remove', (tree) => {
		actual = tree;
	});
	const tree = instance.createTree('Wait');
	instance.removeTree(tree.getId());
	t.is(actual, tree);
});