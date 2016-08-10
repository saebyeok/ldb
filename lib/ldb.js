/**
 * @author Saebeyok
 * @since 0.1.0
 */

"use strict";
var _ = require('lodash'),
    path = require('path'),
    level = require('levelup'),
    leveldown = require('leveldown');

var conns = {};

var options = {
    keyEncoding : 'utf8',
    valueEncoding : 'json',
    cacheSize : 8 * 1024 * 1024, // 8MB
    compression : true
};

module.exports = {
    /**
     *
     * @param {string} name
     * @param {Object} opts
     * @returns {*}
     */
    open : function(name, opts){
        opts = opts || options;
        if(_.isUndefined(conns[name])){
            conns[name] = level(path.normalize(__dirname + '/../../dbs/'+name), opts);
            console.log('opened ldb ' + name);
        }
        else if( conns[name].isClosed() ){
            conns[name].open(function(){
                console.log('reopened ldb ' + name);
            });
        }
        conns[name]._name = name;
        return conns[name];
    },
    close : function(name){
        if( conns[name].isOpen() ){
            conns[name].close();
        }
    },
    getConn : function(name){
        if( _.isUndefined(conns[name]) ) {
            //console.error( 'undefined '+ name + ' connection');
            return conns; //  return all connection
        }
        return conns[name];
    },
    closeAll : function (){
        _.forEach(conns, function(val, key){
            if(val.isOpen()){
                val.close();
            }
        });
    },
    destroy : function (name, cb){
        if(conns[name]){
            if( conns[name].isOpen() ){
                conns[name].close();
            }
        }

        //var location = path.normalize(__dirname + '/../../dbs/'+ name);
        leveldown.destroy('/../../dbs/'+ name, function(err){
            if(err) { console.error(err); return; }

            console.log('removed ldb ' + name);
            cb();
        });
    }
};