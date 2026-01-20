'use client';

import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronRight, File, Folder, FolderOpen } from 'lucide-react';
import * as React from 'react';

export interface TreeDataItem {
  id: string;
  label: string;
  children?: TreeDataItem[];
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  data?: any;
}

interface TreeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  data: TreeDataItem[];
  initialExpandedIds?: string[];
  onNodeClick?: (item: TreeDataItem) => void;
  selectedId?: string;
  /**
   * Whether to show default folder/file icons
   * @default true
   */
  showDefaultIcons?: boolean;
  renderIcon?: (props: {
    item: TreeDataItem;
    level: number;
    isOpen: boolean;
    isLeaf: boolean;
    parentItem?: TreeDataItem;
  }) => React.ReactNode;
  renderActions?: (props: {
    item: TreeDataItem;
    level: number;
    isOpen: boolean;
    isLeaf: boolean;
    parentItem?: TreeDataItem;
  }) => React.ReactNode;
}

const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      data,
      initialExpandedIds,
      onNodeClick,
      selectedId,
      showDefaultIcons = true,
      renderIcon,
      renderActions,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('select-none space-y-1', className)} {...props}>
        {data.map((item) => (
          <TreeNode
            key={item.id}
            item={item}
            initialExpandedIds={initialExpandedIds}
            onNodeClick={onNodeClick}
            selectedId={selectedId}
            showDefaultIcons={showDefaultIcons}
            renderIcon={renderIcon}
            renderActions={renderActions}
            level={0}
          />
        ))}
      </div>
    );
  }
);
Tree.displayName = 'Tree';

interface TreeNodeProps {
  item: TreeDataItem;
  initialExpandedIds?: string[];
  onNodeClick?: (item: TreeDataItem) => void;
  selectedId?: string;
  showDefaultIcons?: boolean;
  renderIcon?: (props: {
    item: TreeDataItem;
    level: number;
    isOpen: boolean;
    isLeaf: boolean;
    parentItem?: TreeDataItem;
  }) => React.ReactNode;
  renderActions?: (props: {
    item: TreeDataItem;
    level: number;
    isOpen: boolean;
    isLeaf: boolean;
    parentItem?: TreeDataItem;
  }) => React.ReactNode;
  level: number;
  parentItem?: TreeDataItem;
}

const TreeNode = ({
  item,
  initialExpandedIds,
  onNodeClick,
  selectedId,
  showDefaultIcons,
  renderIcon,
  renderActions,
  level,
  parentItem,
}: TreeNodeProps) => {
  const [isOpen, setIsOpen] = React.useState(initialExpandedIds?.includes(item.id) || false);

  const hasChildren = item.children && item.children.length > 0;
  const isSelected = selectedId === item.id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick?.(item);
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full">
      {hasChildren ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div
            className={cn(
              'group flex items-center gap-2 rounded-md px-2 py-1.5 transition-all duration-200 ease-in-out cursor-pointer',
              'text-gray-500 hover:bg-blue-50/80 hover:text-[#3b82f6]',
              isSelected && 'text-[#3b82f6] bg-blue-50/80 font-medium',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            )}
            onClick={handleSelect}
          >
            <div
              className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-muted-foreground/10 transition-colors"
              onClick={toggleOpen}
            >
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-muted-foreground/70',
                  isOpen && 'rotate-90'
                )}
              />
            </div>

            <div className="flex items-center gap-2 flex-1 truncate">
              {item.icon ? (
                <div className="text-muted-foreground shrink-0">{item.icon}</div>
              ) : renderIcon ? (
                <div className="shrink-0">
                  {renderIcon({ item, level, isOpen, isLeaf: !hasChildren, parentItem })}
                </div>
              ) : showDefaultIcons ? (
                <div className="text-primary/60 shrink-0">
                  {isOpen ? (
                    <FolderOpen className="h-3.5 w-3.5" />
                  ) : (
                    <Folder className="h-3.5 w-3.5" />
                  )}
                </div>
              ) : null}
              <span className="text-sm truncate">{item.label}</span>
            </div>
            {renderActions ? (
              <div className="shrink-0 opacity-100 transition-opacity">
                {renderActions({ item, level, isOpen, isLeaf: !hasChildren, parentItem })}
              </div>
            ) : (
              item.actions && (
                <div className="shrink-0 opacity-100 transition-opacity">{item.actions}</div>
              )
            )}
          </div>
          <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
            <div className="ml-3.5 border-l border-muted/50 pl-2.5 mt-0.5 space-y-0.5">
              {item.children?.map((child) => (
                <TreeNode
                  key={child.id}
                  item={child}
                  initialExpandedIds={initialExpandedIds}
                  onNodeClick={onNodeClick}
                  selectedId={selectedId}
                  showDefaultIcons={showDefaultIcons}
                  renderIcon={renderIcon}
                  renderActions={renderActions}
                  level={level + 1}
                  parentItem={item}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div
          className={cn(
            'group flex items-center gap-2 rounded-md px-2 py-1.5 transition-all duration-200 ease-in-out cursor-pointer',
            'text-gray-500 hover:bg-blue-50/80 hover:text-[#3b82f6]',
            isSelected && 'text-[#3b82f6] bg-blue-50/80 font-medium',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
          )}
          onClick={handleSelect}
        >
          <div className="flex items-center gap-2 flex-1 truncate">
            <div className="w-4 h-4 shrink-0" /> {/* Placeholder for Chevron alignment */}
            {item.icon ? (
              <div className="text-muted-foreground shrink-0">{item.icon}</div>
            ) : renderIcon ? (
              <div className="shrink-0">
                {renderIcon({ item, level, isOpen, isLeaf: true, parentItem })}
              </div>
            ) : showDefaultIcons ? (
              <div className="text-muted-foreground/50 shrink-0">
                <File className="h-3.5 w-3.5" />
              </div>
            ) : null}
            <span className="text-sm truncate">{item.label}</span>
          </div>
          {renderActions ? (
            <div className="shrink-0 opacity-100 transition-opacity">
              {renderActions({ item, level, isOpen, isLeaf: true, parentItem })}
            </div>
          ) : (
            item.actions && (
              <div className="shrink-0 opacity-100 transition-opacity">{item.actions}</div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export { Tree };
