<template>
    <div id="app">

        <h5 class="logo">Next5</h5>
        <div class="main flex-sm-row flex-column d-flex">
            <div class="sidebar">
                <h5 class="sidebar__title">Next 5 Races</h5>
                <div class="sidebar__filter justify-content-center d-flex">
                    <div class="btn-group btn-group-sm" data-toggle="buttons">
                        <label class="btn btn-secondary" :class="{'active':isFiltering(type)}"
                               v-for="(type,index) in types">
                            <input v-model="race_filter" :value="type" type="checkbox"
                                   @click="disableIfOnlyOne(type,$event)"
                            > {{type}}
                        </label>

                    </div>
                </div>
                <ul class="list-group list-group-flush">
                    <transition-group name="list" tag="div">
                        <div :key="race.id" @click="currentRace=race" class="list-group-item"
                             :class="{'active':race===currentRace}"
                             v-for="(race,index) in sortedFilteredRaces">
                            <div class="d-flex w-100 justify-content-between small">
                                <span style="font-weight: 700;">{{race.meeting.name}}</span>
                                <span>{{race.name}}</span>
                                <span style="font-size:1.1em">{{formatRaceTime(race)}}</span>
                                <span class="detail">{{race.type}}</span>
                            </div>
                        </div>
                    </transition-group>
                </ul>
            </div>
            <div class="card competitors" style="width:100%;" v-if="currentRace!=null&&currentRace.competitors">
                <div class="card-header">
                    <h5 class="card-title">{{currentRace.meeting.name}} </h5>
                    <h6 class="card-subtitle mb-2 text-muted">{{currentRace.type}}</h6>
                </div>
                <div class="card-body">
                    <div class="content">
                        <h5 class="content__title">
                            <img width="20" height="20" src="./assets/clock.svg"> {{formatRaceTime(currentRace)}}
                        </h5>
                        <div class="content__box">
                            <table class="table table-responsive">
                                <thead class="thead-light">
                                <tr>
                                    <th scope="col">Position</th>
                                    <th scope="col">Competitor</th>
                                    <th scope="col">Country</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="(competitor) in currentRace.competitors">
                                    <th scope="row">{{competitor.position}}</th>
                                    <td>{{competitor.name}}</td>
                                    <td>{{(showFlag(competitor.country))}}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
  import * as R from 'ramda'
  import { racesApi } from './services/api'
  import moment from 'moment'
  import { flag } from 'country-emoji'

  export default {
    name: 'App',
    created () {
      this.currentTimestamp = Math.round(new Date().getTime() / 1000)
      setInterval(() => {
        this.currentTimestamp = Math.round(new Date().getTime() / 1000)
      }, 300)
    },
    mounted () {
      this.loadData()
    },
    data () {
      return {
        currentTimestamp: 0,
        types: [
          'Thoroughbred',
          'Greyhounds',
          'Harness'
        ],
        //default filter checked
        race_filter: [
          'Thoroughbred'
        ],
        races: [],
        currentRace: null
      }
    },
    methods: {
      loadData () {
        racesApi.then(xhr => {
          this.races = xhr.data
        })
      },
      showFlag (code) {
        return flag(code)
      },
      formatRaceTime (race) {
        let s = race.suspend - this.currentTimestamp
        if (s < 0) {
          if (race === this.currentRace) {
            this.currentRace = null
          }
          const index = this.races.indexOf(race)
          this.races.splice(index, 1)
          this.loadData()
        }
        if (s > 120) {
          return moment.unix(race.suspend).fromNow(true)
        }
        return s + ' seconds'
      },
      isFiltering (type) {
        return this.race_filter.indexOf(type) >= 0
      },
      filterRace (races, types) {
        return R.filter(R.where({type: R.contains(R.__, types)}))(races)
      },
      disableIfOnlyOne (type, e) {
        if (this.race_filter.length === 1 && this.isFiltering(type) === true) {
          console.log(e)
          e.stopPropagation()
          e.preventDefault()
        }

      }
    },
    computed: {
      filteredRaces () {
        return this.filterRace(this.races, this.race_filter)
      },
      sortedFilteredRaces () {
        return R.slice(0, 5, R.sortBy(R.prop('suspend'))(this.filteredRaces))
      }
    },
    watch: {},
  }
</script>

<style lang="scss">
    @import "~bootstrap/scss/bootstrap.scss";
    @import "./main.scss";
    @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,700');

    .list-item {
        display: inline-block;
        margin-right: 10px;
    }

    .list-enter-active, .list-leave-active {
        transition: all 0.2s ease !important;
    }

    .list-enter, .list-leave-to {
        opacity: 0;
        transform: translateX(30px);
    }

    .list-leave-active {
        position: absolute;
    }

    .list-move {
        transition: all 0.3s;
    }

    .logo {
        padding: 40px 100px;
        color: #fff;
    }

    h5 {
        font-weight: 700;
        font-size: 1.1em;
    }

    #app {
        margin: 0;
        padding: 0;
        min-height: 100%;
        width: 100%;
        color: #000005;
        font-family: 'Open Sans', sans-serif;
        background-image: url('./assets/bg.svg'), -webkit-gradient(linear, left top, right bottom, from(#44358c), to(#000));
        background-position: top;
        background-repeat: repeat-x, no-repeat;
        padding-bottom: 100px;
    }

    .table-responsive {
        display: table;
    }

    .list-group-item {
        &.active {
            & .detail {
                color: #fff;
            }
            color: #fff !important;
            background-color: #D32223;
            border-color: transparent;
        }
        &:not(.active):hover {
            box-shadow: 0 0 10px #ddd;
            transform: scale(1.04);
        }
        & .detail {
            position: absolute;
            bottom: 8px;
        }
        user-select: none;
        transition: all .3s ease;
        overflow: hidden;
        height: 65px;
        box-sizing: border-box;
        cursor: pointer;
    }

    html, body {
        height: 100%;
        margin: 0;
    }

    thead > tr > th {
        background-color: #252525 !important;
        color: #fff !important;
    }

    body {
        background: #000;
    }

    .card-header {
    }

    .sidebar {
        &__title {
            margin: 0;
        }
        &:hover {
            box-shadow: 0px 0px 20px #ddd;
        }
        &__filter {
            & > .btn-group > label {
                font-size: 11px !important;
            }
            margin-top: 1em;
        }
        box-shadow: 0px 0px 10px #ddd;
        width: 300px;
        background: #eee;
        border-radius: 10px;
        min-height: 50vh;
        padding: 10px 15px;
        margin-right: 20px;
        margin-bottom: 20px;
        box-sizing: border-box;
        transition: all .4s ease;
    }

    .content {
        &__title {
            color: #fff;
            padding: 10px;
        }
        &__box {
            background-color: #fff;
            margin: 5px;
            width: 100%;
            padding: 10px;
            overflow: scroll;
        }
        box-sizing: border-box;
        padding: 10px;
        border-radius: 10px;
        background: #D32223;
        width: 100%;
    }

    .competitors {
        border-radius: 10px;
        border: none;

    }

    tr {
        cursor: pointer;
    }

    .main {
        width: 80%;
        margin: 0 auto;
        min-height: 50vh;
    }
</style>
