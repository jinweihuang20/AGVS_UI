<template>
  <div class="map-point-setting-drawer">
    <el-drawer
      v-model="show"
      size="35%"
      :close-on-press-escape="true"
      :close-on-click-modal="false"
      :show-close="false"
    >
      <template #header>
        <div class="header border-bottom">
          <h3>點位設定-{{ index }}</h3>
        </div>
      </template>
      <div class="draw-content w-100 px-2">
        <div class="text-start py-2">
          <b-button variant="danger" @click="CancelBtnClickHandle">離開</b-button>
          <b-button variant="primary" @click="SaveBtnClickHandle">儲存</b-button>
        </div>
        <div class="settings px-2">
          <el-collapse v-model="activeNames">
            <el-collapse-item title="基本設定" name="1">
              <el-form label-width="120px" label-position="left">
                <el-form-item label="Point Index">
                  <el-input v-model="index" disabled></el-input>
                </el-form-item>
                <el-form-item label="顯示名稱">
                  <div>
                    <el-input v-model="pointData_editing.Name"></el-input>
                  </div>
                  <div>
                    <el-button
                      v-show="IsEQPoint"
                      @click="pointData_editing.Name=BindingEQInfo.Name"
                    >使用繫連的EQ名稱</el-button>
                  </div>
                </el-form-item>
                <el-form-item label="Tag">
                  <div class="tag">
                    <div>
                      <span>ID</span>
                      <el-input v-model.number="pointData_editing.TagNumber"></el-input>
                    </div>
                    <div>
                      <span>X</span>
                      <el-input v-model="pointData_editing.X"></el-input>
                    </div>
                    <div>
                      <span>Y</span>
                      <el-input v-model="pointData_editing.Y"></el-input>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item label="站點類型">
                  <el-select v-model="pointData_editing.StationType" @change="StationTypeOnChange">
                    <el-option
                      v-for="pt_type in stationTypes"
                      :key="pt_type.value"
                      :label="pt_type.label"
                      :value="pt_type.value"
                    ></el-option>
                  </el-select>
                  <div v-show="IsEQPoint">
                    <el-input disabled v-model="BindingEQInfo.Name"></el-input>
                  </div>
                </el-form-item>
                <el-form-item label="角度">
                  <el-input v-model="pointData_editing.Direction"></el-input>
                </el-form-item>
                <el-form-item label="雷射模式">
                  <el-input v-model="pointData_editing.LsrMode"></el-input>
                </el-form-item>
                <el-form-item label="速度">
                  <el-input v-model="pointData_editing.Speed"></el-input>
                </el-form-item>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="功能設定" name="2">
              <div class="d-flex flex-column">
                <el-checkbox v-model="pointData_editing.Enable" label="啟用"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsStandbyPoint" label="停駐點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsSegment" label="二次定位點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsParking" label="可停車點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsAvoid" label="避車點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsVirtualPoint" label="虛擬點"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsAutoDoor" label="自動門"></el-checkbox>
                <el-checkbox v-model="pointData_editing.IsExtinguishing" label="消防設備"></el-checkbox>
              </div>
            </el-collapse-item>
            <el-collapse-item title="Consistency" name="3">
              <el-form>
                <el-form-item label="Point Index">
                  <el-input v-model="index" disabled></el-input>
                </el-form-item>
              </el-form>
            </el-collapse-item>
            <el-collapse-item title="分區設定" name="4">
              <el-form>
                <el-form-item label="所屬區域">
                  <RegionsSelector v-model="pointData_editing.Region"></RegionsSelector>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { GetEQInfoByTag } from '@/api/EquipmentAPI.js';
import { pointTypes } from '@/api/MapAPI.js'
import RegionsSelector from '@/components/RegionsSelector.vue'

export default {
  components: {
    RegionsSelector
  },
  data() {
    return {
      show: false,
      index: -1,
      pointData: {},
      pointData_editing: {},
      activeNames: ['1'],
      BindingEQInfo: {
        ConnOptions: {
          ConnMethod: 0,
          IP: "127.0.0.1",
          Port: 503,
          ComPort: "COM1"
        },
        Name: "LDULD#2",
        TagID: 2
      }
    }
  },
  mounted() {
  },
  computed: {
    hasAnyChange() {
      var ori_ = JSON.stringify(this.pointData)
      var current_ = JSON.stringify(this.pointData_editing)
      return ori_ != current_;
    },
    IsEQPoint() {
      return this.pointData_editing.StationType == 1;
    },
    stationTypes() {
      return pointTypes;
    }
  },
  methods: {
    async Show(ptObj) {

      this.index = ptObj.index
      this.pointData = ptObj.point

      // {
      //   "ConnOptions": {
      //       "ConnMethod": 0,
      //       "IP": "127.0.0.1",
      //       "Port": 503,
      //       "ComPort": "COM1"
      //   },
      //   "Name": "LDULD#2",
      //   "TagID": 2
      // }

      this.pointData_editing = JSON.parse(JSON.stringify(ptObj.point))

      if (this.IsEQPoint)//EQ
      {
        this.BindingEQInfo = await GetEQInfoByTag(this.pointData.TagNumber);
      }
      this.show = true;
    },
    async StationTypeOnChange(e) {
      if (e == 1) {
        this.BindingEQInfo = await GetEQInfoByTag(this.pointData.TagNumber);
      }
    },

    SaveBtnClickHandle() {
      this.pointData = this.pointData_editing;
      this.$emit('OnPointSettingChanged', { index: this.index, pointData: this.pointData })

      this.$swal.fire({
        title: 'SAVE!',
        text: '站點設定已暫存，請記得儲存圖資。',
        icon: 'success',
        showCancelButton: false,
        showConfirmButton: false,
        confirmButtonText: 'OK',
        customClass: 'my-sweetalert',
        timer: 1000,
      })
    },
    CancelBtnClickHandle() {
      if (this.hasAnyChange) {

        this.$swal.fire({
          title: '尚未儲存',
          text: '設定值變更但尚未儲存，確定要關閉?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: '確定',
          customClass: 'my-sweetalert'
        }).then((result) => {
          if (result.isConfirmed) {
            this.show = false;
          }
        })

      } else
        this.show = false;
    },

  },
}
</script>

<style lang="scss" scoped >
.map-point-setting-drawer {
  z-index: 2;
  .draw-content {
    top: 67px;
    position: absolute;
    height: 100%;
    .settings {
      height: 800px;
      overflow-y: scroll;
    }
    button {
      width: 120px;
      margin-right: 3px;
    }
  }
  .tag {
    display: flex;
    flex-direction: row;
    div {
      display: flex;
      flex-direction: row;
      margin: 3px;
    }
  }
}
</style>