const graphql = require("graphql");
const axios = require("axios");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

const EmpresaTipo = new GraphQLObjectType({
  name: "Empresa",
  fields: () => ({
    id: { type: GraphQLString },
    nombre: { type: GraphQLString },
    descripcion: { type: GraphQLString },
    empleados: {
      type: new GraphQLList(EmpleadoTipo),
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/empresas/${parentValue.id}/empleados`)
          .then(res => res.data);
      }
    }
  })
});

const EmpleadoTipo = new GraphQLObjectType({
  name: "Empleado",
  fields: () => ({
    id: { type: GraphQLString },
    nombre: { type: GraphQLString },
    edad: { type: GraphQLInt },
    empresa: {
      type: EmpresaTipo,
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/empresas/${parentValue.empresaId}`)
          .then(res => res.data);
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    empleado: {
      type: EmpleadoTipo,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/empleados/${args.id}`)
          .then(resp => resp.data);
      }
    },
    empresa: {
      type: EmpresaTipo,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return axios
          .get(`http://localhost:3000/empresas/${args.id}`)
          .then(resp => resp.data);
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addEmpleado: {
      type: EmpleadoTipo,
      args: {
        nombre: { type: new GraphQLNonNull(GraphQLString) },
        edad: { type: GraphQLInt },
        empresaId: { type: GraphQLString }
      },
      resolve(parentValue, { nombre, edad, empresaId }) {
        return axios
          .post("http://localhost:3000/empleados", { nombre, edad, empresaId })
          .then(res => res.data);
      }
    },
    deleteEmpleado: {
      type: EmpleadoTipo,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { id }) {
        return axios
          .delete(`http://localhost:3000/empleados/${id}`)
          .then(res => res.data);
      }
    },
    editEmpleado: {
      type: EmpleadoTipo,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        nombre: { type: GraphQLString },
        edad: { type: GraphQLInt },
        empresaId: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        return axios
          .patch(`http://localhost:3000/empleados/${args.id}`, args)
          .then(res => res.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  mutation,
  query: RootQuery
});
