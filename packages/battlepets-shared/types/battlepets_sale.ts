/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/battlepets_sale.json`.
 */
export interface BattlepetsSale {
  address: '4Cmeroq292g2tFfwTdhu8Sj9MZucrcyRYBTqNF9DsoRY'
  metadata: {
    name: 'battlepetsSale'
    version: '0.1.0'
    spec: '0.1.0'
    description: 'Created with Anchor'
  }
  instructions: [
    {
      name: 'addSaleAllocation'
      discriminator: [79, 249, 83, 234, 192, 135, 5, 42]
      accounts: [
        {
          name: 'saleAllocation'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'account'
                path: 'contributor'
              },
            ]
          }
        },
        {
          name: 'sale'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [103, 108, 111, 98, 97, 108]
              },
            ]
          }
        },
        {
          name: 'contributor'
          writable: true
          signer: true
        },
        {
          name: 'fundRaiser'
          writable: true
          address: 'E8R2i17Pzhy912JcwJ4mXinkv65KsUSHeGUZqjVGJczH'
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: [
        {
          name: 'amount'
          type: 'u64'
        },
      ]
    },
    {
      name: 'closeSale'
      discriminator: [124, 201, 1, 146, 231, 103, 193, 152]
      accounts: [
        {
          name: 'sale'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [103, 108, 111, 98, 97, 108]
              },
            ]
          }
        },
        {
          name: 'fundRaiser'
          writable: true
          signer: true
          address: 'E8R2i17Pzhy912JcwJ4mXinkv65KsUSHeGUZqjVGJczH'
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: []
    },
    {
      name: 'openSale'
      discriminator: [246, 220, 152, 93, 31, 43, 199, 143]
      accounts: [
        {
          name: 'sale'
          writable: true
          pda: {
            seeds: [
              {
                kind: 'const'
                value: [103, 108, 111, 98, 97, 108]
              },
            ]
          }
        },
        {
          name: 'fundRaiser'
          writable: true
          signer: true
          address: 'E8R2i17Pzhy912JcwJ4mXinkv65KsUSHeGUZqjVGJczH'
        },
        {
          name: 'systemProgram'
          address: '11111111111111111111111111111111'
        },
      ]
      args: []
    },
  ]
  accounts: [
    {
      name: 'saleAllocationState'
      discriminator: [155, 135, 105, 204, 93, 212, 209, 127]
    },
    {
      name: 'saleState'
      discriminator: [21, 13, 249, 194, 208, 96, 243, 65]
    },
  ]
  errors: [
    {
      code: 6000
      name: 'closedSale'
      msg: 'Sale is closed'
    },
    {
      code: 6001
      name: 'minIndividualAllocation'
      msg: 'Amount must be over minimum sale allocation'
    },
    {
      code: 6002
      name: 'maxIndividualAllocation'
      msg: 'Amount must not reach over maximum sale allocation'
    },
    {
      code: 6003
      name: 'maxTotalAllocation'
      msg: 'Amount must not reach over total sale allocation'
    },
  ]
  types: [
    {
      name: 'saleAllocationState'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'contributor'
            type: 'pubkey'
          },
          {
            name: 'amount'
            type: 'u64'
          },
        ]
      }
    },
    {
      name: 'saleState'
      type: {
        kind: 'struct'
        fields: [
          {
            name: 'open'
            type: 'bool'
          },
          {
            name: 'amount'
            type: 'u64'
          },
        ]
      }
    },
  ]
}
