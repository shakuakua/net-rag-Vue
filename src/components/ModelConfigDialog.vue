<!-- src/components/SettingsDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="模型配置"
    width="500px"
    :before-close="handleClose"
  >
    <el-tabs v-model="activeTab" type="card">
      <!-- LLM 配置标签页 -->
      <el-tab-pane label="LLM 配置" name="llm">
        <el-form
          :model="llmForm"
          :rules="llmRules"
          ref="llmFormRef"
          label-width="100px"
        >
          <el-form-item label="Base URL" prop="baseURL">
            <el-input v-model="llmForm.baseURL" placeholder="请输入 Base URL" />
          </el-form-item>
          <el-form-item label="API Key" prop="apiKey">
            <el-input v-model="llmForm.apiKey" placeholder="请输入 API Key" show-password />
          </el-form-item>
          <el-form-item label="模型" prop="model">
            <el-input v-model="llmForm.model" placeholder="请输入模型名称" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Embedding 配置标签页 -->
      <el-tab-pane label="Embedding 配置" name="embedding">
        <el-form
          :model="embeddingForm"
          :rules="embeddingRules"
          ref="embeddingFormRef"
          label-width="100px"
        >
          <el-form-item label="Base URL" prop="baseURL">
            <el-input v-model="embeddingForm.baseURL" placeholder="请输入 Base URL" />
          </el-form-item>
          <el-form-item label="API Key" prop="apiKey">
            <el-input v-model="embeddingForm.apiKey" placeholder="请输入 API Key" show-password />
          </el-form-item>
          <el-form-item label="模型" prop="model">
            <el-input v-model="embeddingForm.model" placeholder="请输入模型名称" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Reranker 配置标签页 -->
      <el-tab-pane label="Reranker 配置" name="reranker">
        <el-form
          :model="rerankerForm"
          :rules="rerankerRules"
          ref="rerankerFormRef"
          label-width="100px"
        >
          <el-form-item label="API Key" prop="apiKey">
            <el-input v-model="rerankerForm.apiKey" placeholder="请输入 API Key" show-password />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSettings" :loading="saving">保存</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive,watch } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useChatStore } from '@/store/chatStore'
// 使用chatStore
const chatStore = useChatStore()

// 定义 emits
const emit = defineEmits(['update:visible'])

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 控制对话框显示
const dialogVisible = ref(props.visible)
const saving = ref(false)

// 监听 visible prop 变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

// 监听 dialogVisible 变化
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    emit('update:visible', false)
  }
})

// 当前激活的标签页
const activeTab = ref<'llm' | 'embedding' | 'reranker'>('llm');

// 表单引用
const llmFormRef = ref<FormInstance>()
const embeddingFormRef = ref<FormInstance>()
const rerankerFormRef = ref<FormInstance>()

// LLM 表单数据
const llmForm = reactive({
  baseURL: '',
  apiKey: '',
  model: ''
})

// Embedding 表单数据
const embeddingForm = reactive({
  baseURL: '',
  apiKey: '',
  model: ''
})

// Reranker 表单数据
const rerankerForm = reactive({
  apiKey: ''
})

// 表单验证规则
const llmRules = {
  baseURL: [{ required: true, message: '请输入 Base URL', trigger: 'blur' }],
  apiKey: [{ required: true, message: '请输入 API Key', trigger: 'blur' }],
  model: [{ required: true, message: '请输入模型名称', trigger: 'blur' }]
}

const embeddingRules = {
  baseURL: [{ required: true, message: '请输入 Base URL', trigger: 'blur' }],
  apiKey: [{ required: true, message: '请输入 API Key', trigger: 'blur' }],
  model: [{ required: true, message: '请输入模型名称', trigger: 'blur' }]
}

const rerankerRules = {
  apiKey: [{ required: true, message: '请输入 API Key', trigger: 'blur' }]
}

// 关闭前的处理
const handleClose = () => {
  dialogVisible.value = false
}

// 保存设置
const saveSettings = async () => {
  let formRef: FormInstance | undefined
  let formData: any
  let configType:keyof typeof chatStore.modelConfig

  // 根据当前激活的标签页确定要提交的表单和接口
  switch (activeTab.value) {
    case 'llm':
      formRef = llmFormRef.value
      formData = { ...llmForm }
      configType = 'llm'
      break
    case 'embedding':
      formRef = embeddingFormRef.value
      formData = { ...embeddingForm }
      configType = 'embedding'
      break
    case 'reranker':
      formRef = rerankerFormRef.value
      formData = { ...rerankerForm }
      configType = 'reranker'
      break
    default:
      return
  }

  if (!formRef) return

  // 表单验证
  try {
    await formRef.validate()
  } catch (error) {
    return
  }

  // 提交数据
  try {
    saving.value = true
    const response = await chatStore.saveModelConfig(configType, formData)

    if (response.code === 200) {
      ElMessage.success(response.message || '设置保存成功')
    } else {
      ElMessage.error(response.message || '设置保存失败')
    }
  } catch (error) {
    ElMessage.error('设置保存失败')
    console.error('保存设置时出错:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
