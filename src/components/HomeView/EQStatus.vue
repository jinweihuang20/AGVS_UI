<template>
  <div class="eq-status px-4 py-1 w-100">
    <div class="text-start border-bottom p-2 my-2 d-flex flex-row justify-content-space">
      <div class="d-flex">
        <div class="p-1">
          <i class="bi bi-three-dots-vertical pt-2"></i>區域選擇
        </div>
        <RegionsSelector v-model="selected_region"></RegionsSelector>
        <!-- <el-select v-model="selected_region" title="區域" @change="RegionSelectChanged">
          <el-option
            v-for="opt in valid_map_regions_options"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          ></el-option>
        </el-select>-->
      </div>
      <div class="legend d-flex flex-row px-2">
        <div class="disconnect"></div>
        <span>斷線</span>
        <div class="signal-on"></div>
        <span>訊號[ON]</span>
        <div class="signal-off"></div>
        <span>訊號[OFF]</span>
      </div>
    </div>
    <el-table
      style="width:890px"
      height="600"
      border
      :header-cell-style="{color:'black',backgroundColor:'white'}"
      :data="display_data"
      :row-style="{fontWeight:'bold'}"
      :row-class-name="eq_connection_status"
      row-key="EQName"
    >
      <el-table-column sortable label="設備名稱" prop="EQName" width="140">
        <template #default="scope">
          <div>
            {{ scope.row.EQName }}
            <el-tooltip placement="top-start" content="複製到剪貼簿">
              <i @click="CopyText(scope.row.EQName)" class="copy-button copy-icon bi bi-clipboard"></i>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column sortable label="區域" prop="Region" width="110"></el-table-column> -->
      <el-table-column label="L_Requset" prop="Load_Reuest" :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Load_Reuest)">L_Requset</div>
        </template>
      </el-table-column>
      <el-table-column label="U_Requset" prop="Unload_Request" :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Unload_Request)">U_Requset</div>
        </template>
      </el-table-column>
      <el-table-column label="Port Exist" prop="Port_Exist" :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Port_Exist)">Port Exist</div>
        </template>
      </el-table-column>
      <el-table-column label="UP_POS" prop="Up_Pose" :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Up_Pose)">UP_POS</div>
        </template>
      </el-table-column>
      <el-table-column label="DOWN_POS" prop="Down_Pose" :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Down_Pose)">DOWN_POS</div>
        </template>
      </el-table-column>
      <el-table-column label="EQP Down" prop="Eqp_Status_Down" :width="column_width">
        <template #default="scope">
          <div class="di-status" v-bind:style="signalOn(scope.row.Eqp_Status_Down)">EQP Down</div>
        </template>
      </el-table-column>
      <el-table-column type="expand" width="30">
        <template #default="scope">
          <div v-if="IsDeveloperLogining" class="d-flex mx-5">
            <div class="mx-3">模擬器:</div>
            <el-button @click="LDULD_Emu_State_Switch(scope.row.EQName,'busy')">切換為Busy</el-button>
            <el-button @click="LDULD_Emu_State_Switch(scope.row.EQName,'load')">切換為Load</el-button>
            <el-button @click="LDULD_Emu_State_Switch(scope.row.EQName,'unload')">切換為Unload</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import WebSocketHelp from '@/api/WebSocketHepler';
import RegionsSelector from '@/components/RegionsSelector.vue'
import Clipboard from 'clipboard'
import { ElNotification } from 'element-plus'
import { EmuAPI } from '@/api/EquipmentAPI.js'
import bus from '@/event-bus'
import store from '@/store';
import { userStore } from '@/store';
export default {
  components: {
    RegionsSelector,
  },
  data() {
    return {
      column_width: 120,
      eq_data: [
        {
          IsConnected: true,
          EQName: 'GB123#1',
          Load_Reuest: false,
          Unload_Request: true,
          Port_Exist: true,
          Up_Pose: false,
          Down_Pose: true,
          Eqp_Status_Down: true,
          Region: '',
        }
      ],
      selected_region: "all",
    }
  },
  computed: {
    IsDeveloperLogining() {
      return userStore.getters.IsDeveloperLogining;
    },
    display_data() {
      if (this.selected_region == 'all')
        return this.eq_data;
      else {
        return this.eq_data.filter(eq => eq.Region == this.selected_region)
      }
    }
  },
  mounted() {
    this.WsConnect();
    var signal_divs = document.getElementsByClassName('di-status');

  },
  methods: {
    userStoreTest() {
      alert(userStore.getters.IsDeveloperLogining)
    },
    WsConnect() {

      var ws = new WebSocketHelp('/ws/EQStatus');
      ws.Connect();
      ws.onmessage = (ev) => {
        this.eq_data = JSON.parse(ev.data)
        var unload_req_EQS = this.eq_data.filter(eq => eq.Unload_Request).map(eq => eq.Tag)
        bus.emit('unload_eq_tags', unload_req_EQS)
      }

    },
    eq_connection_status(row, rowIndex) {
      var isConnected = row.row.IsConnected;
      return isConnected ? 'success-row' : 'error-row';
    },
    signalOn(status) {
      if (status) {
        return {
          backgroundColor: 'lime'
        }
      }
      else {
        return {
          backgroundColor: 'rgb(204, 204, 204)'
        }
      }
    },
    RegionSelectChanged(val) {
      this.selected_region = val;
    },
    filterRegionData(value, row, column) {
      console.log(row)
    },
    CopyText(text) {
      const clipboard = new Clipboard('.copy-button', {
        text: () => text
      });
      clipboard.on('success', () => {
        ElNotification({
          title: text,
          message: "已複製到剪貼簿",
          duration: 1500
        })
        clipboard.destroy();
      });

      clipboard.on('error', () => {
        clipboard.destroy();
      });
    },
    LDULD_Emu_State_Switch(EQName = "", mode = 'busy|load|unlod') {
      EmuAPI.SetState(EQName, mode)
    }
  }
}
</script>

<style lang="scss" >
.eq-status {
  width: 800px;
  .legend {
    div {
      width: 40px;
      height: 12px;
      border-radius: 4px;

      margin-right: 3px;
      margin-top: 5px;
    }
    div:hover {
      cursor: pointer;
    }
    span {
      margin-right: 20px;
      font-weight: bold;
      font-size: 14px;
      color: rgb(112, 112, 112);
    }
    .disconnect {
      background-color: rgb(245, 108, 108);
    }
    .signal-on {
      background-color: lime;
    }
    .signal-off {
      background-color: rgb(204, 204, 204);
    }
  }
  .di-status {
    color: rgb(139, 139, 139);
    height: 22px;
    padding: 0;
    margin: 0;
    text-align: center;
    font-size: 9px;
    border-radius: 4px;
    cursor: pointer;
  }

  .el-table .success-row {
    --el-table-tr-bg-color: var(--el-color-success-light-9);
  }
  .el-table .error-row {
    --el-table-tr-bg-color: var(--el-color-error);
    color: white;
  }
}
</style>