import {
  makeSchema,
  nonNull,
  objectType,
  inputObjectType,
  arg,
  asNexusMethod,
  nullable,
} from 'nexus'
import { nexusPrisma } from 'nexus-plugin-prisma'
import { DateTimeResolver } from 'graphql-scalars'
import { Context } from './context'

const DateTime = asNexusMethod(DateTimeResolver, 'date')

const Query = objectType({
  name: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('allUsers', {
      type: 'User',
      resolve: (_, __, { prisma }) => {
        return prisma.user.findMany()
      },
    })
    t.field('userById', {
      type: nullable('User'),
      args: {
        id: nonNull('ID'),
      },
      resolve: (_, { id }, { prisma }: Context) => {
        return prisma.user.findUnique({ where: { id } })
      },
    })
  },
})

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.nonNull.list.nonNull.field('signUpUser', {
      type: 'User',
      args: {
        data: nonNull(
          arg({
            type: 'UserCreateInput',
          }),
        ),
      },
      resolve: async (_, { data }, { prisma }: Context) => {
        await prisma.user.create({
          data: {
            email: data.email,
          },
        })

        return prisma.user.findMany()
      },
    })
  },
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.model.id()
    t.model.email()
  },
})

const UserCreateInput = inputObjectType({
  name: 'UserCreateInput',
  definition(t) {
    t.nonNull.string('email')
  },
})

export const schema = makeSchema({
  types: [Query, Mutation, User, UserCreateInput, DateTime],
  outputs: {
    schema: __dirname + '/generated/schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  plugins: [
    nexusPrisma({
      shouldGenerateArtifacts: true,
    }),
  ],
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})
