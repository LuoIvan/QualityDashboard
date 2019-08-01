<template>
  <div v-if="detail!==undefined">
    <div v-if="detail.project" class="main">
      <div class="change-title">Change - {{detail._number}} - {{detail.subject}}</div>
      <div class="main" style="margin: 10px">
        <div class="change-section">
          <span class="section-title">Updated</span>
          <span>{{detail.updated}}</span>
        </div>
        <div class="change-section">
          <span class="section-title">Project</span>
          <span>{{detail.project}}</span>
        </div>
        <div class="change-section">
          <span class="section-title">Status</span>
          <span>{{detail.status}}</span>
        </div>
        <div class="change-section">
          <span class="section-title">Strategy</span>
          <span>{{detail.submit_type}}</span>
        </div>
        <div class="change-section">
          <span class="section-title">Owner</span>
          <span>{{detail.owner.name}}</span>
        </div>
        <div class="change-section">
          <div class="section-title">Reviewers</div>
          <div v-if="detail.reviewers" class="code-review-tags">
            <div v-for="reviewer in detail.reviewers['REVIEWER']"
                 class="code-review-tag">
              <el-tag type="info">{{reviewer.name}}</el-tag>
            </div>
          </div>
        </div>

        <div class="change-section">
          <div class="section-title">Code-Review</div>
          <div v-if="detail.labels" class="code-review-tags">
            <div v-if="codeReview.value!==0" v-for="codeReview in detail.labels['Code-Review'].all"
                 class="code-review-tag">
              <el-tag type="success" v-if="codeReview.value===2">+{{codeReview.value}} {{codeReview.name}}</el-tag>
              <el-tag type="warning" v-if="codeReview.value===1">+{{codeReview.value}} {{codeReview.name}}</el-tag>
              <el-tag type="danger" v-if="codeReview.value===-1">{{codeReview.value}} {{codeReview.name}}</el-tag>
            </div>
          </div>
        </div>

        <el-card class="main">
          <div slot="header">
            <span>Place your Bet</span>
          </div>
          <el-form label-position="left" label-width="80px" style="text-align: left">
            <el-form-item label="Category">
              <div class="outcome-select">
                <el-tag type="success" @click.native="clickOutcome(2)"
                        :class="{'select-success':selectedOutcomeIndex===2}">+2 Looks good to
                  me, approved
                </el-tag>
                <el-tag type="warning" @click.native="clickOutcome(1)"
                        :class="{'select-warning':selectedOutcomeIndex===1}">+1 Looks good to me, but someone else must
                  approve
                </el-tag>
                <el-tag type="danger" @click.native="clickOutcome(-1)"
                        :class="{'select-danger':selectedOutcomeIndex===-1}">-1 I would prefer that you didn’t submit this
                </el-tag>

              </div>


            </el-form-item>
            <el-form-item label="Value">
              <el-slider v-model="betValue" :max="balance" show-input v-if="balance!==0"></el-slider>
            </el-form-item>
          </el-form>
          <el-button type="primary" round @click="submitBet">Submit bet</el-button>

        </el-card>
      </div>
    </div>

  </div>


</template>

<script>
  export default {
    name: "ChangeDetail",
    watch: {
      '$route': 'updateView'
    },
    methods: {
      updateView: function () {
        this.detail = {};
        let id = this.$router.currentRoute.params.id;
        document.title="Change - "+id;
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        this.$axios.get('/api/change/detail?id=' + id)
          .then(response => {
            this.detail = response.data.detail;
            loading.close()
          })
      },
      clickOutcome: function (index) {
        this.selectedOutcomeIndex = index
      },
      submitBet: function () {
        console.log(this.betValue, this.selectedOutcomeIndex)
      }
    },
    data() {
      return {
        detail: {},
        betValue: 0,
        selectedOutcomeIndex: 0
      }
    },
    created: function () {
      this.updateView();
    },
    computed: {
      balance() {
        return this.$store.getters.getUserInfo ?
          this.$store.getters.getUserInfo.qcoin.qcoinBalance.total -
          this.$store.getters.getUserInfo.qcoin.qcoinBalance.frozen
          : 0
      }
    },
    beforeRouteLeave(to, from, next) {
      to.meta.keepAlive = (to.path === "/history" || to.path === "/dashboard" || to.path === "/personal");
      next();
    }
  }
</script>

<style scoped>
  .success {
    border: 2px solid red;
  }

  .change-title {
    background-color: #EEEEEE;
    color: #333;
    text-align: left;
    line-height: 30px;
    padding: 0 5px;
    word-break: break-word;
  }

  .section-title {
    min-width: 100px;
    max-width: 100px;
    text-align: left;

  }

  .change-section {
    display: flex;
    align-items: center;
    line-height: 30px;
  }

  .code-review-tags {
    display: flex;
    flex-wrap: wrap
  }

  .code-review-tag {
    padding: 0 5px 5px 0;

  }

  .outcome-select .el-tag {
    margin-right: 10px;
  }

  .outcome-select .el-button {
    padding: 5px 10px
  }

  .el-button + .el-button {
    margin-left: 0;
  }

  .select-success {
    background: #85ce61;
    color: white;
  }

  .select-warning {
    background: #e6a23c;
    color: white;
  }
  .select-danger {
    background: #f56c6c;
    color: white;
  }

  .el-tag {
    font-size: 13px;
    cursor: pointer;
  }
</style>
