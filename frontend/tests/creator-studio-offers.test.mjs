import test from 'node:test';
import assert from 'node:assert/strict';
import { studioSources } from '../src/studio/model.ts';
import { copyDesignContext, studioDesignPath, studioReturn, linkedPieceQuery } from '../src/studio/navigation.ts';

const project = '789e4567-e89b-12d3-a456-426614174000';

test('studioSources gathers both proposal and native catalog offers with distinct stable references', () => {
  const proposal = {
    version: 1,
    offering: 'Repostería artesanal',
    audience: 'Vecinos de la zona',
    need: '',
    value: '',
    message: '',
    conditions: '',
    cta: 'Pedir por WhatsApp',
    whatsapp: '',
    nativeIds: [],
    offers: [
      {
        id: 'offer-brownie',
        name: 'Brownie de chocolate',
        description: 'Con nueces y chocolate amargo',
        image: 'https://example.com/brownie.jpg',
        kind: 'product',
        pricing: 'fixed',
        price: 12,
        conditions: '',
      },
    ],
  };

  const catalog = {
    version: 1,
    dishes: [
      {
        id: 'dish-cafe',
        name: 'Café de la casa',
        description: 'Tostado medio 100% arábica',
        image: 'https://example.com/cafe.jpg',
        price: 8,
      },
      {
        id: 'dish-galleta',
        name: 'Galleta de avena',
        description: 'Recién horneada',
        price: 5,
      },
    ],
  };

  const sources = studioSources({
    project,
    type: 'restaurant',
    proposal,
    page: null,
    catalog,
    revisions: {
      proposal: 'rev-prop-1',
      page: null,
      catalog: 'rev-cat-1',
    },
  });

  const offerSources = sources.filter(s => s.group === 'offer');
  assert.equal(offerSources.length, 3);

  const brownie = offerSources.find(s => s.reference?.id === 'offer-brownie');
  assert.ok(brownie);
  assert.equal(brownie.title, 'Brownie de chocolate');
  assert.equal(brownie.reference?.kind, 'proposal');
  assert.equal(brownie.reference?.projectId, project);

  const cafe = offerSources.find(s => s.reference?.id === 'restaurant:dish-cafe');
  assert.ok(cafe);
  assert.equal(cafe.title, 'Café de la casa');
  assert.equal(cafe.reference?.kind, 'catalog');
  assert.equal(cafe.reference?.projectId, project);
});

test('selected offers query param preserves multiple offers and ignores deleted or foreign IDs', () => {
  const sources = [
    {
      key: 'proposal:offer-brownie',
      title: 'Brownie de chocolate',
      body: 'S/ 12.00',
      image: '',
      cta: 'Pedir',
      reference: { projectId: project, kind: 'proposal', id: 'offer-brownie', revision: '1' },
      group: 'offer',
    },
    {
      key: 'catalog:restaurant:dish-cafe',
      title: 'Café de la casa',
      body: 'S/ 8.00',
      image: '',
      cta: 'Pedir',
      reference: { projectId: project, kind: 'catalog', id: 'restaurant:dish-cafe', revision: '1' },
      group: 'offer',
    },
  ];

  // User selects brownie, cafe, and an old/deleted offer ID
  const rawParam = 'offer-brownie,restaurant:dish-cafe,deleted-offer-999';
  const requestedIds = rawParam.split(',').map(s => s.trim()).filter(Boolean);

  const offerSources = sources.filter(s => s.group === 'offer');
  const matched = offerSources.filter(s => {
    const id = s.reference?.id || '';
    const keyNoPrefix = s.key.replace(/^(proposal|catalog):/, '');
    return requestedIds.includes(id) || requestedIds.includes(s.key) || requestedIds.includes(keyNoPrefix);
  });

  assert.equal(matched.length, 2);
  assert.equal(matched[0].title, 'Brownie de chocolate');
  assert.equal(matched[1].title, 'Café de la casa');
});

test('studio navigation helpers preserve offers context across design and editor transitions', () => {
  const fromParams = new URLSearchParams({
    project,
    tab: 'posts',
    offers: 'offer-brownie,restaurant:dish-cafe',
    topic: 'Café y productos',
  });

  const toParams = new URLSearchParams();
  // copyDesignContext
  copyDesignContext(fromParams, toParams);
  assert.equal(toParams.get('offers'), 'offer-brownie,restaurant:dish-cafe');
  assert.equal(toParams.get('topic'), 'Café y productos');

  // studioDesignPath carries offers
  const designPath = studioDesignPath(fromParams, project, 'aa420f8a-2267-4fbf-b1bb-e756278fd352');
  assert.ok(designPath.includes('offers=offer-brownie%2Crestaurant%3Adish-cafe'));
  assert.ok(designPath.includes('tab=create'));
  assert.ok(designPath.includes('compose=idea'));

  // linkedPieceQuery carries offers
  const pieceQuery = linkedPieceQuery(project, 'piece-123', fromParams);
  assert.ok(pieceQuery.includes('offers=offer-brownie%2Crestaurant%3Adish-cafe'));

  // studioReturn carries offers
  const ret = studioReturn(fromParams, null, project, 'library');
  assert.ok(ret.path.includes('offers=offer-brownie%2Crestaurant%3Adish-cafe'));
});
