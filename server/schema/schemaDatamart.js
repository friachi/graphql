const graphql = require('graphql');
const database = require('../database/oracle');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList
} = graphql;

const _ = require('lodash');

//Batch Of Extractions
const BatchOfExtractionsType = new GraphQLObjectType({
    name : 'BatchOfExtractions',
    fields: () => ({
        MXREF: { type: GraphQLString },
        LABEL: { type: GraphQLString },
        DESCRIPTION: { type: GraphQLString },
        MANDATORYEOD: { type: GraphQLString },
        LABELOFDATA: { type: GraphQLString },
        DATAPRECOMPUTED : { type: GraphQLString },
        HISTORIZATIONMODE : { type: GraphQLString },
        DATAISPUBLIC: { type: GraphQLString },
        COMPUTEDBYSEVERALBATCHES: { type: GraphQLString }
    })
});

//Extractions
const ExtractionType = new GraphQLObjectType({
    name : 'Extraction',
    fields: () => ({
        MXREF: { type: GraphQLString },
        LABEL: { type: GraphQLString },
        DESCRIPTION: { type: GraphQLString },
        SCANNERREF: { type: GraphQLString },
        REQLABEL: { type: GraphQLString },
        REQMXREF : { type: GraphQLString }
    })
});

////////////// The Root Query /////////////:/
const RootQuery = new GraphQLObjectType({
    name : 'RootQueryType',
    fields: {
        BatchOfExtractions: {
        type: BatchOfExtractionsType,
        args: {LABEL: {type: GraphQLString}},
        async resolve(parent,args){
            //code to get data from db
            let sql = `select
                        batch.M_REF as mxRef,
                        trim(batch.M_LABEL) as label,
                        trim(batch.M_DESC) as description,
                        batch.M_OPTIONAL as mandatoryEod,
                        case batch.M_TYPE
                         when 1 then 'BoF'
                         when 2 then 'BoE'
                         when 3 then 'BoS'
                        else '' end as batchType,
                        trim(batch.M_TAGDATA) as labelOfData,
                        batch.M_DATACOMP as dataPreComputed,
                        batch.M_DATASHARED as dataIsPublic,
                        batch.M_SERIALIZED as computedBySeveralBatches,
                        trim(batch.M_FLTTEMP) as filterLabelRef,
                        case batch.M_DATAHIS
                         when 0 then 'one dataset'
                         when 1 then 'one dataset per day'
                         when 2 then 'one dataset per run'
                         else ''
                        end as historizationMode,
                        batch.M_SCNTMPL as scannerRef,
                        batch.M_EXCTMPL as exceptionRef,
                        batch.M_EMAIL_REF as emailRef
                        from ACT_SET_DBF batch
                        where batch.M_TYPE = 2 and trim(batch.M_LABEL) = :label`;
              let binds = [args.LABEL];
              const result = await database.simpleExecute(sql,binds);
              console.log(result.metaData);
              return result.rows[0];
            }
        },
        AllBatchOfExtractions: {
                      type: new GraphQLList(BatchOfExtractionsType),
                      async resolve(parent,args){
                          //code to get data from db
                          let sql = `select
                                     batch.M_REF as mxRef,
                                     trim(batch.M_LABEL) as label,
                                     trim(batch.M_DESC) as description,
                                     batch.M_OPTIONAL as mandatoryEod,
                                     case batch.M_TYPE
                                      when 1 then 'BoF'
                                      when 2 then 'BoE'
                                      when 3 then 'BoS'
                                     else '' end as batchType,
                                     trim(batch.M_TAGDATA) as labelOfData,
                                     batch.M_DATACOMP as dataPreComputed,
                                     batch.M_DATASHARED as dataIsPublic,
                                     batch.M_SERIALIZED as computedBySeveralBatches,
                                     trim(batch.M_FLTTEMP) as filterLabelRef,
                                     case batch.M_DATAHIS
                                      when 0 then 'one dataset'
                                      when 1 then 'one dataset per day'
                                      when 2 then 'one dataset per run'
                                      else ''
                                     end as historizationMode,
                                     batch.M_SCNTMPL as scannerRef,
                                     batch.M_EXCTMPL as exceptionRef,
                                     batch.M_EMAIL_REF as emailRef
                                     from ACT_SET_DBF batch
                                      where batch.M_LABEL <> ' ' and batch.M_TYPE = 2`;
                            const result = await database.simpleExecute(sql);
                            return result.rows;
                      }
        },
        Extraction: {
                type: ExtractionType,
                args: {LABEL: {type: GraphQLString}},
                async resolve(parent,args){
                    //code to get data from db
                    let sql = `select
                               single.M_REF as MXREF,
                               trim(single.M_LABEL) as LABEL,
                               trim(single.M_DESC) as DESCRIPTION,
                               single.M_EXECTX as OBJTYPE,
                               single.M_SCNTMPL as SCANNERREF,
                               case single.M_EXECTX
                               when 7 then trim(extReq.M_LABEL)
                               when 8 then trim(extSp.M_LABEL)
                               else ''
                               end as REQLABEL,
                               case single.M_EXECTX
                                when 7 then extReq.M_REF
                                when 8 then extSp.M_REF
                                else -1
                               end as REQMXREF
                               from ACT_BAT_DBF single
                               left join ACT_EXTR_DBF singleExt on single.M_REF = singleExt.M_REF_BATCH
                               left join ACT_REQXTR_DBF extReq on singleExt.M_REF_REQ = extReq.M_REF
                               left join ACT_STDPRC_DBF singleSp on single.M_REF = singleSp.M_REF_BATCH
                               left join ACT_REQPROC_DBF extSp on singleSp.M_REF_REQ = extSp.M_REF
                               where single.M_EXECTX = 7 and trim(single.M_LABEL) = :label`;
                      let binds = [args.LABEL];
                      const result = await database.simpleExecute(sql,binds);
                      return result.rows[0];
                    }
                },
        AllExtractions: {
                        type: new GraphQLList(ExtractionType),
                        async resolve(parent,args){
                            //code to get data from db
                            let sql = `select
                                       single.M_REF as MXREF,
                                       trim(single.M_LABEL) as LABEL,
                                       trim(single.M_DESC) as DESCRIPTION,
                                       single.M_EXECTX as OBJTYPE,
                                       single.M_SCNTMPL as SCANNERREF,
                                       case single.M_EXECTX
                                       when 7 then trim(extReq.M_LABEL)
                                       when 8 then trim(extSp.M_LABEL)
                                       else ''
                                       end as REQLABEL,
                                       case single.M_EXECTX
                                        when 7 then extReq.M_REF
                                        when 8 then extSp.M_REF
                                        else -1
                                       end as REQMXREF
                                       from ACT_BAT_DBF single
                                       left join ACT_EXTR_DBF singleExt on single.M_REF = singleExt.M_REF_BATCH
                                       left join ACT_REQXTR_DBF extReq on singleExt.M_REF_REQ = extReq.M_REF
                                       left join ACT_STDPRC_DBF singleSp on single.M_REF = singleSp.M_REF_BATCH
                                       left join ACT_REQPROC_DBF extSp on singleSp.M_REF_REQ = extSp.M_REF
                                       where single.M_EXECTX = 7`;
                              const result = await database.simpleExecute(sql);
                              return result.rows;
                            }
                        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
})