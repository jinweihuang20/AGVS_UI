import axios from 'axios'
import param from '@/gpm_param'
import moment from 'moment'
import { getAuthHeaders } from './AuthHelper'
var axios_entity = axios.create({
  baseURL: param.backend_host,
  headers: {},
})

export class clsMoveTaskData {
  constructor(agv_name, to_tag, Priority = 50) {
    this.TaskName = `*Local_${moment(Date.now()).format('yyyyMMDD_HHmmssSSS')}`
    this.Action = 0
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = to_tag + ''
    this.To_Slot = '-1'
    this.Carrier_ID = '-1'
    this.Priority = Priority
  }
}

export class clsLoadTaskData {
  constructor(agv_name, to_tag, to_slot, cst_id, Priority = 50) {
    this.TaskName = `*Local_${moment(Date.now()).format('yyyyMMDD_HHmmssSSS')}`
    this.Action = 7
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = to_tag + ''
    this.To_Slot = to_slot + ''
    this.Carrier_ID = cst_id
    this.Priority = Priority
  }
}

export class clsUnloadTaskData {
  constructor(agv_name, to_tag, to_slot, cst_id, Priority = 50) {
    this.TaskName = `*Local_${moment(Date.now()).format('yyyyMMDD_HHmmssSSS')}`
    this.Action = 1
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = to_tag + ''
    this.To_Slot = to_slot + ''
    this.Carrier_ID = cst_id
    this.Priority = Priority
  }
}

export class clsChargeTaskData {
  constructor(agv_name, to_tag, Priority = 50) {
    this.TaskName = `*Local_${moment(Date.now()).format('yyyyMMDD_HHmmssSSS')}`
    this.Action = 8
    this.DesignatedAGVName = agv_name
    this.From_Station = '-1'
    this.From_Slot = '-1'
    this.To_Station = to_tag + ''
    this.To_Slot = '-1'
    this.Carrier_ID = '-1'
    this.Priority = Priority
  }
}
export class clsCarryTaskData {
  constructor(
    agv_name,
    from_tag,
    from_slot,
    to_tag,
    to_slot,
    cst_id,
    Priority = 50,
  ) {
    this.TaskName = `*Local_${moment(Date.now()).format('yyyyMMDD_HHmmssSSS')}`
    this.Action = 9
    this.DesignatedAGVName = agv_name
    this.From_Station = from_tag + ''
    this.From_Slot = from_slot + ''
    this.To_Station = to_tag + ''
    this.To_Slot = to_slot + ''
    this.Carrier_ID = cst_id
    this.Priority = Priority
  }
}

export var TaskAllocation = {
  async Task() {
    axios_entity
      .get(`/api/Task/Allocation`, { headers: getAuthHeaders() })
      .then((response) => {
        console.log('Response:', response.data)
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  },
  async Cancel(taskName) {
    return await axios_entity.get(`/api/Task/Cancel?task_name=${taskName}`, {
      headers: getAuthHeaders(),
    })
  },
  async MoveTask(clsMoveTaskData = new clsMoveTaskData('agv', 1)) {
    return await CallAPI('/api/Task/Move', clsMoveTaskData)
  },
  async LoadTask(clsLoadTaskData = new clsLoadTaskData('agv', 1, 1, 'CST_ID')) {
    return await  CallAPI('/api/Task/Load', clsLoadTaskData)
  },
  async UnloadTask(
    clsUnloadTaskData = new clsUnloadTaskData('agv', 1, 1, 'CST_ID'),
  ) {
    return await  CallAPI('/api/Task/Unload', clsUnloadTaskData)
  },
  async CarryTask(clsCarryTaskData) {
    return await CallAPI('/api/Task/Carry', clsCarryTaskData)
  },
  async ChargeTask(clsChargeTaskData) {
    return await  CallAPI('/api/Task/Charge', clsChargeTaskData)
  },
}

async function CallAPI(path, data) {
  return axios_entity
    .post(path, data, { headers: getAuthHeaders() })
    .then((response) => {
      console.log('Response:', response.data)
      return response.data
    })
    .catch((error) => {
      console.error('Error:', error)
      return error.response.data
    })
}
