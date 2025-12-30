<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2 class="logo-text" @click="clickLogo">风间</h2>
    </div>
    
    <div class="movie-tabs">
      <el-menu
        :default-openeds="['library']"
        :default-active="defaultActive"
        class="sidebar-menu"
        @select="handleSelect"
        background-color="#2c3e50"
        text-color="#fff"
        active-text-color="#1abc9c"
        unique-opened
        mode="vertical"
        default-opened
      >
        <el-menu-item 
          v-for="item in simpleMenuItems" 
          :key="item.key" 
          :index="item.key"
        >
          <i :class="item.icon"></i>
          <span slot="title">{{ item.name }}</span>
        </el-menu-item>
        
        <el-submenu 
          v-for="subMenu in subMenuItems" 
          :key="subMenu.key" 
          :index="subMenu.key" 
        >
          <template slot="title">
            <i :class="subMenu.icon"></i>
            <span>{{ subMenu.name }}</span>
            <span class="menu-count">{{ subMenu.count }}</span>
          </template>
          <el-menu-item 
            v-for="child in subMenu.children" 
            :key="child.key" 
            :index="child.key"
          >
            <i :class="child.icon"></i>
            {{ child.name }}
            <span  class="menu-count">{{ child.count }}</span>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </div>
  </div>
</template>

<script>
import { movieStat } from '@/api/movie/movie'
export default {
  name: 'MovieTabs',
  data() {
    return {
      defaultActive: 'home',
      simpleMenuItems: [
        { key: 'home', name: '首页', icon: 'el-icon-menu' },
        { key: 'history', name: '收藏记录', icon: 'el-icon-film' }
      ],
      subMenuItems: [
        { 
          key: 'library', 
          name: '影视库', 
          icon: 'el-icon-video-play',
          count: '',
          children: [
            { key: 'library', name: '全部', icon: 'el-icon-s-grid', count: '' },
            { key: 'anime', name: '动漫', icon: 'el-icon-star-off', count: '' },
            { key: 'animeMovie', name: '动漫电影', icon: 'el-icon-video-camera', count: '' },
            { key: 'jpTV', name: '日剧', icon: 'el-icon-monitor', count: '' },
          ] 
        }
      ]
    }
  },
  mounted() {
    this.loadData();
  },
     
  methods: {
    loadData(){
      movieStat().then(res => {
           let data = res.data;
        // 根据后端字段更新菜单项计数
        this.subMenuItems.forEach(menu => {
          // 更新一级菜单"影视库"的总计数
          if (menu.key === 'movies') {
            menu.count = data.totalCount || 0;
          }
          
          // 更新子菜单的计数
          if (menu.children && Array.isArray(menu.children)) {
            menu.children.forEach(child => {
              switch (child.key) {
                case 'anime':
                  child.count = data.totalAnime || '';
                  break;
                case 'animeMovie':
                  child.count = data.totalAnimeMovie || '';
                  break;
                case 'jpTV':
                  child.count = data.totalJpTV || '';
                  break;
                case 'library':
                  child.count = data.totalCount || '';
                  break;
                default:
                  child.count = 0;
              }
            });
          }
        });   
      })
    },
    handleSelect(index){
        this.$emit('menu-selected', index);
    },
    // 点击logo
    clickLogo(){
        this.$emit('show-login');
    }
  }
}
</script>

<style scoped lang="scss">
.sidebar {
  width: 220px;
  background-color: #2c3e50;
  color: white;
  height: calc(100vh);
  position: fixed;
  overflow-y: auto;
  
  .sidebar-header {
    padding: 20px;
    background-color: #1a252f;
    
    .logo-text {
      cursor: pointer;
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #ecf0f1;
      text-shadow: 
        2px 2px 4px rgba(0, 0, 0, 0.5),
        0 0 10px rgba(26, 188, 156, 0.3);
      font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
      letter-spacing: 2px;
      transition: all 0.3s ease;
      
      &:hover {
        color: #1abc9c;
        text-shadow: 
          2px 2px 4px rgba(0, 0, 0, 0.5),
          0 0 15px rgba(26, 188, 156, 0.6);
        transform: scale(1.05);
      }
    }
  }
}
.sidebar-menu {
  text-align: left;
  
  ::v-deep .el-menu-item,
  ::v-deep .el-submenu__title {
    display: flex;
    align-items: center;
    
    .menu-count {
      margin-left: auto;
      // background-color: #1abc9c;
      color: white;
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 12px;
      line-height: 1;
    }
  }
  
  ::v-deep .el-submenu__title {
    .menu-count {
      margin-right: 20px; // 为箭头留出空间
    }
  }
}
</style>